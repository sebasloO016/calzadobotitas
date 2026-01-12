// controllers/stockController.js
const Stock = require('../models/stockModel');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');


/* =====================================================
   🖼️ FUNCIÓN ÚNICA PARA RUTA PÚBLICA DE IMÁGENES
===================================================== */
function fotoPublica(foto) {
    if (!foto) return null;

    // Normaliza slashes (Windows → Linux/Web)
    const f = String(foto).replace(/\\/g, '/').trim();

    // Si ya es ruta pública completa
    if (f.startsWith('/uploads/')) return f;

    // Si viene como uploads/...
    if (f.startsWith('uploads/')) return `/${f}`;

    // Si es solo el nombre del archivo
    return `/uploads/productos/${f}`;
}

/* =====================================================
   📄 VISTA BASE / BUSCADOR
===================================================== */
exports.index = (req, res) => {
    res.render('stock/index', {
        producto: null,
        variantes: [],
        error: null
    });
};

/* =====================================================
   🔍 AUTOCOMPLETE STOCK
===================================================== */
exports.autocomplete = (req, res) => {
    const texto = (req.query.texto || '').trim();
    if (texto.length < 2) return res.json([]);

    Stock.autocomplete(texto, (err, rows) => {
        if (err) {
            console.error(err);
            return res.json([]);
        }

        const data = rows.map(r => ({
            ...r,
            Foto: fotoPublica(r.Foto)
        }));

        res.json(data);
    });
};

/* =====================================================
   📱 ENTRADA POR QR (VARIANTE EXACTA)
===================================================== */
exports.verPorQr = (req, res) => {
    const { qr } = req.params;

    Stock.getByQr(qr, (err, v) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error interno');
        }

        if (!v) {
            return res.render('stock/verVariante', {
                producto: null,
                error: 'QR no encontrado'
            });
        }

        res.render('stock/verVariante', {
            error: null,
            producto: {
                Codigo: v.Codigo,
                Nombre: v.Nombre,
                Foto: fotoPublica(v.Foto),
                Precio: v.PrecioVenta,
                Talla: v.Talla,
                Color: v.Color,
                Material: v.Material,
                Ubicacion: v.Ubicacion,
                Stock: v.Stock,
                QrCode: v.QrCode
            }
        });
    });
};

/* =====================================================
   ⌨️ ENTRADA POR CÓDIGO MANUAL (912, ETC)
===================================================== */
exports.verPorCodigo = (req, res) => {
    const { codigo } = req.params;

    Stock.getVariantesByCodigo(codigo, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error interno');
        }

        if (!rows || rows.length === 0) {
            return res.render('stock/index', {
                producto: null,
                variantes: [],
                error: 'Producto no encontrado'
            });
        }

        const base = rows[0];

        const producto = {
            Codigo: base.Codigo,
            Nombre: base.Nombre,
            Foto: fotoPublica(base.Foto),
            Precio: base.PrecioVenta
        };

        const variantes = rows
            .filter(r => r.VarianteID)
            .map(r => ({
                VarianteID: r.VarianteID,
                Stock: r.Stock,
                QrCode: r.QrCode,
                Talla: r.Talla,
                Color: r.Color,
                Material: r.Material,
                Ubicacion: r.Ubicacion
            }));

        res.render('stock/index', {
            producto,
            variantes,
            error: null
        });
    });
};
exports.qrImage = async (req, res) => {
    const { qr } = req.params;

    try {
        const url = `${req.protocol}://${req.get('host')}/stock/qr/${qr}`;

        res.setHeader('Content-Type', 'image/png');

        await QRCode.toFileStream(res, url, {
            width: 300,
            margin: 2
        });
    } catch (err) {
        console.error('Error QR image:', err);
        res.status(500).send('Error generando QR');
    }
};
exports.qrPdf = (req, res) => {
    const { qr } = req.params;

    const doc = new PDFDocument({ size: 'A6', margin: 20 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=QR-${qr}.pdf`);

    doc.pipe(res);

    const qrUrl = `${req.protocol}://${req.get('host')}/stock/qr/${qr}`;

    // Título
    doc.fontSize(14).text('Inventario Botitas', { align: 'center' });
    doc.moveDown(0.5);

    // QR
    QRCode.toDataURL(qrUrl, { width: 200 }, (err, url) => {
        if (err) {
            doc.text('Error generando QR');
            doc.end();
            return;
        }

        const base64 = url.replace(/^data:image\/png;base64,/, '');
        const img = Buffer.from(base64, 'base64');

        doc.image(img, {
            fit: [180, 180],
            align: 'center'
        });

        doc.moveDown(0.5);
        doc.fontSize(10).text(`QR: ${qr}`, { align: 'center' });

        doc.end();
    });
};
exports.qrPdfMasivo = async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No se enviaron items para imprimir' });
    }

    const QRCode = require('qrcode');
    const PDFDocument = require('pdfkit');

    // ===== CONFIGURACIÓN ETIQUETAS =====
    const CM_TO_PT = 28.35;
    const LABEL_SIZE = 3 * CM_TO_PT; // 3cm ≈ 85pt
    const TEXT_HEIGHT = 18;          // espacio para texto
    const GAP = 6;

    const PAGE_WIDTH = 595.28;   // A4
    const PAGE_HEIGHT = 841.89;
    const MARGIN = 30;

    const COLS = Math.floor((PAGE_WIDTH - MARGIN * 2) / (LABEL_SIZE + GAP));
    const ROWS = Math.floor((PAGE_HEIGHT - MARGIN * 2) / (LABEL_SIZE + GAP + TEXT_HEIGHT));

    const doc = new PDFDocument({ size: 'A4', margin: MARGIN });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=QRs-masivo.pdf');

    doc.pipe(res);

    let x = MARGIN;
    let y = MARGIN;
    let count = 0;

    for (const item of items) {
        const qrUrl = `${req.protocol}://${req.get('host')}/stock/qr/${item.qr}`;

        // generar QR
        const dataUrl = await QRCode.toDataURL(qrUrl, { margin: 0 });
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        const img = Buffer.from(base64, 'base64');

        // dibujar QR
        doc.image(img, x, y, {
            width: LABEL_SIZE,
            height: LABEL_SIZE
        });

        // texto humano (debajo del QR)
        const texto = [
            `${item.codigo || ''} · T${item.talla || '-'}`,
            `${item.color || ''} · ${item.ubicacion || ''}`
        ].join('\n');

        doc
            .fontSize(6)
            .fillColor('#000')
            .text(
                texto,
                x,
                y + LABEL_SIZE + 2,
                {
                    width: LABEL_SIZE,
                    align: 'center'
                }
            );

        // mover posición
        x += LABEL_SIZE + GAP;
        count++;

        // salto de columna
        if (count % COLS === 0) {
            x = MARGIN;
            y += LABEL_SIZE + TEXT_HEIGHT + GAP;
        }

        // nueva página
        if (count % (COLS * ROWS) === 0) {
            doc.addPage();
            x = MARGIN;
            y = MARGIN;
        }
    }

    doc.end();
};
