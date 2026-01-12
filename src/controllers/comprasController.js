const Compra = require('../models/comprasModel');

// GET /compras
exports.listarCompras = (req, res) => {
    Compra.getAll((err, compras) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al cargar compras');
        }
        res.render('compras/verCompras', { compras });
    });
};

// GET /compras/ver/:id
exports.verCompra = (req, res) => {
    const id = req.params.id;

    Compra.getById(id, (err, compra) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al cargar compra');
        }
        if (!compra) return res.status(404).send('Compra no encontrada');

        Compra.getDetalle(id, (err, detalle) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al cargar detalle');
            }

            Compra.getPagos(id, (err, pagos) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error al cargar pagos');
                }

                // total pagado para mostrar
                const totalPagado = (pagos || []).reduce((s, p) => s + Number(p.MontoPagado || 0), 0);

                res.render('compras/verDetalleCompra', {
                    compra,
                    detalle: detalle || [],
                    pagos: pagos || [],
                    totalPagado
                });
            });
        });
    });
};

// POST /compras/pagar/:id
exports.pagarCompra = (req, res) => {
    const CompraProveedorID = req.params.id;
    const { FechaPago, MontoPagado, MetodoPago, Referencia } = req.body;

    const monto = Number(MontoPagado);
    if (!FechaPago || !monto || monto <= 0) {
        return res.status(400).send('Datos de pago inválidos');
    }

    Compra.registrarPago({
        CompraProveedorID,
        FechaPago,
        MontoPagado: monto,
        MetodoPago: MetodoPago || 'Transferencia',
        Referencia: Referencia || null
    }, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al registrar pago');
        }
        res.redirect(`/compras/ver/${CompraProveedorID}`);
    });
};
