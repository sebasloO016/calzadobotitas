// src/controllers/reportesController.js
const reportesModel = require('../models/reportesModel');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const db = require('../db/db');

exports.getDashboard = (req, res) => {
  res.render('reportes/dashboard');
};

// Datos para el dashboard (JSON)
exports.getDatosDashboard = (req, res) => {
  const { inicio, fin } = req.query;
  reportesModel.obtenerIndicadores(inicio, fin, (err, data) => {
    if (err) {
      console.error('❌ Error al generar reportes:', err);
      return res.status(500).json({ error: 'Error al generar reportes.' });
    }
    res.json(data);
  });
};

// Comparativo dinámico AJAX (SEGURO con parámetros)
exports.getComparativoInteractivo = (req, res) => {
  const { inicioA, finA, inicioB, finB } = req.query;
  if (!inicioA || !finA || !inicioB || !finB) {
    return res.status(400).json({ error: 'Faltan rangos A/B' });
  }

  const sql = `
    SELECT 'Periodo A' AS periodo, ROUND(COALESCE(SUM(dv.ValorTotal),0),2) AS total
    FROM ventas v 
    JOIN detalleventas dv ON v.VentaID=dv.VentaID
    WHERE v.Estado <> 'Anulada' AND DATE(v.Fecha) BETWEEN ? AND ?
    UNION ALL
    SELECT 'Periodo B' AS periodo, ROUND(COALESCE(SUM(dv.ValorTotal),0),2) AS total
    FROM ventas v 
    JOIN detalleventas dv ON v.VentaID=dv.VentaID
    WHERE v.Estado <> 'Anulada' AND DATE(v.Fecha) BETWEEN ? AND ?;
  `;

  db.query(sql, [inicioA, finA, inicioB, finB], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al comparar periodos' });
    res.json(result);
  });
};

// Exportar a Excel (PRO)
exports.exportarExcel = (req, res) => {
  const { inicio, fin } = req.query;

  reportesModel.obtenerIndicadores(inicio, fin, async (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al generar Excel.' });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Gerencial');

    sheet.mergeCells('A1', 'E1');
    sheet.getCell('A1').value = 'Reporte Gerencial - Calzado Botitas';
    sheet.getCell('A1').font = { bold: true, size: 16 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.addRow([]);
    sheet.addRow(['Métrica', 'Valor']);
    sheet.getRow(3).font = { bold: true };

    const k = data.kpi;
    const rot = data.rotacionInventario;

    sheet.addRows([
      ['Ventas Totales', `$${k.ventasTotales}`],
      ['Cantidad de Ventas', `${k.cantidadVentas}`],
      ['Unidades Vendidas', `${k.unidadesVendidas}`],
      ['Costo Total', `$${k.costoTotal}`],
      ['Ganancia Bruta', `$${k.gananciaBruta}`],
      ['Margen %', `${k.margenPorcentaje}%`],
      ['Ticket Promedio', `$${k.ticketPromedio}`],
      ['Rotación Global (salidas/stock)', `${rot.rotacionPromedio}`],
    ]);

    sheet.addRow([]);
    sheet.addRow(['Ventas por Mes']);
    sheet.addRow(['Mes', 'Total']);
    data.ventasPorMes.labels.forEach((mes, i) => sheet.addRow([mes, data.ventasPorMes.valores[i]]));

    sheet.addRow([]);
    sheet.addRow(['Temporada (Mes del año)']);
    sheet.addRow(['Mes', 'Total', 'Ventas']);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    (data.temporadaMes || []).forEach(r => sheet.addRow([meses[r.mesNum - 1], r.total, r.cantidadVentas]));

    sheet.addRow([]);
    sheet.addRow(['Top Rotación por Variante (SALIDAS)']);
    sheet.addRow(['Código', 'Producto', 'Talla', 'Color', 'Material', 'Stock', 'Salidas', 'Última salida']);
    (data.rotacionVariantesTop || []).forEach(r => {
      sheet.addRow([r.Codigo, r.Nombre, r.Talla, r.Color, r.Material, r.StockActual, r.TotalSalidas, r.UltimaSalida ? new Date(r.UltimaSalida).toLocaleString() : '—']);
    });

    sheet.addRow([]);
    sheet.addRow(['Variantes Estancadas (stock > 0)']);
    sheet.addRow(['Código', 'Producto', 'Talla', 'Color', 'Material', 'Stock', 'Días sin salida']);
    (data.variantesEstancadas || []).forEach(r => {
      sheet.addRow([r.Codigo, r.Nombre, r.Talla, r.Color, r.Material, r.StockActual, r.DiasSinSalida]);
    });

    sheet.columns.forEach(col => (col.width = 22));
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Botitas.xlsx"');
    res.send(buffer);
  });
};

// Exportar a PDF (PRO)
exports.exportarPDF = (req, res) => {
  const { inicio, fin } = req.query;

  reportesModel.obtenerIndicadores(inicio, fin, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al generar PDF.' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Botitas.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text('📊 Reporte Gerencial - Calzado Botitas', { align: 'center' });
    doc.moveDown();

    const k = data.kpi;
    doc.fontSize(12).text(`Ventas Totales: $${k.ventasTotales}`);
    doc.text(`Cantidad de Ventas: ${k.cantidadVentas}`);
    doc.text(`Unidades Vendidas: ${k.unidadesVendidas}`);
    doc.text(`Costo Total: $${k.costoTotal}`);
    doc.text(`Ganancia Bruta: $${k.gananciaBruta}`);
    doc.text(`Margen %: ${k.margenPorcentaje}%`);
    doc.text(`Ticket Promedio: $${k.ticketPromedio}`);
    doc.text(`Rotación Global: ${data.rotacionInventario.rotacionPromedio}`);
    doc.moveDown();

    // Temporadas
    doc.fontSize(14).text('📆 Temporada: Mes del Año', { underline: true });
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    (data.temporadaMes || []).forEach(r => {
      doc.fontSize(11).text(`${meses[r.mesNum - 1]}: $${r.total} (${r.cantidadVentas} ventas)`);
    });
    doc.moveDown();

    // Rotación por variante
    doc.fontSize(14).text('🔥 Top Rotación por Variante (SALIDAS)', { underline: true });
    (data.rotacionVariantesTop || []).forEach(r => {
      doc.fontSize(10).text(`${r.Codigo} | ${r.Nombre} | T${r.Talla} ${r.Color}/${r.Material} => Salidas: ${r.TotalSalidas} | Stock: ${r.StockActual}`);
    });
    doc.moveDown();

    // Estancadas
    doc.fontSize(14).text('🧊 Variantes Estancadas (stock>0)', { underline: true });
    (data.variantesEstancadas || []).forEach(r => {
      doc.fontSize(10).text(`${r.Codigo} | ${r.Nombre} | T${r.Talla} ${r.Color}/${r.Material} => ${r.DiasSinSalida} días sin salida | Stock: ${r.StockActual}`);
    });

    doc.moveDown(2);
    doc.text('Generado automáticamente por el Sistema Botitas.', { align: 'right', italic: true });
    doc.end();
  });
};
