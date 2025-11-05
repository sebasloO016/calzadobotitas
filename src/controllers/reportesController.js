// src/controllers/reportesController.js
const reportesModel = require('../models/reportesModel');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

exports.getDashboard = (req, res) => {
  res.render('reportes/dashboard');
};

// 🔹 Datos para el dashboard (JSON)
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

// 🔸 Exportar a Excel
exports.exportarExcel = (req, res) => {
  const { inicio, fin } = req.query;

  reportesModel.obtenerIndicadores(inicio, fin, async (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al generar Excel.' });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Gerencial');

    sheet.mergeCells('A1', 'E1');
    sheet.getCell('A1').value = 'Reporte Gerencial - Botitas';
    sheet.getCell('A1').font = { bold: true, size: 16 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.addRow([]);
    sheet.addRow(['Métrica', 'Valor']);
    sheet.getRow(3).font = { bold: true };

    const kpis = data.kpi;
    const rotacion = data.rotacionInventario;

    const rows = [
      ['Ventas Totales', `$${kpis.ventasTotales}`],
      ['Ganancia Bruta', `$${kpis.gananciaBruta}`],
      ['Ticket Promedio', `$${kpis.ticketPromedio}`],
      ['Costo Total', `$${kpis.costoTotal}`],
      ['IVA Estimado', `$${kpis.ivaEstimado}`],
      ['Rotación Inventario', `${rotacion.rotacionPromedio}`]
    ];
    sheet.addRows(rows);
    sheet.addRow([]);

    // Ventas por mes
    sheet.addRow(['Ventas por Mes']);
    sheet.addRow(['Mes', 'Total']);
    data.ventasPorMes.labels.forEach((mes, i) => {
      sheet.addRow([mes, data.ventasPorMes.valores[i]]);
    });

    // Formato
    sheet.columns.forEach(col => (col.width = 25));
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Botitas.xlsx"');
    res.send(buffer);
  });
};
exports.getComparativoInteractivo = (req, res) => {
  const { inicioA, finA, inicioB, finB } = req.query;
  const sql = `
    SELECT 'Periodo A' AS periodo, ROUND(SUM(dv.ValorTotal),2) AS total
    FROM ventas v JOIN detalleventas dv ON v.VentaID=dv.VentaID
    WHERE DATE(v.Fecha) BETWEEN '${inicioA}' AND '${finA}'
    UNION ALL
    SELECT 'Periodo B' AS periodo, ROUND(SUM(dv.ValorTotal),2) AS total
    FROM ventas v JOIN detalleventas dv ON v.VentaID=dv.VentaID
    WHERE DATE(v.Fecha) BETWEEN '${inicioB}' AND '${finB}';
  `;
  const db = require('../db/db');
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al comparar periodos' });
    res.json(result);
  });
};

// 🔸 Exportar a PDF
exports.exportarPDF = (req, res) => {
  const { inicio, fin } = req.query;

  reportesModel.obtenerIndicadores(inicio, fin, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al generar PDF.' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Botitas.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text('📊 Reporte Gerencial - Botitas', { align: 'center' });
    doc.moveDown();

    const k = data.kpi;
    const rot = data.rotacionInventario;

    doc.fontSize(12).text(`Ventas Totales: $${k.ventasTotales}`);
    doc.text(`Ganancia Bruta: $${k.gananciaBruta}`);
    doc.text(`Ticket Promedio: $${k.ticketPromedio}`);
    doc.text(`Costo Total: $${k.costoTotal}`);
    doc.text(`IVA Estimado: $${k.ivaEstimado}`);
    doc.text(`Rotación Inventario: ${rot.rotacionPromedio}`);
    doc.moveDown(2);

    doc.fontSize(14).text('📆 Ventas por Mes', { underline: true });
    data.ventasPorMes.labels.forEach((mes, i) => {
      doc.fontSize(11).text(`${mes}: $${data.ventasPorMes.valores[i]}`);
    });

    doc.moveDown(2);
    doc.fontSize(14).text('👠 Ventas por Categoría', { underline: true });
    data.ventasPorCategoria.labels.forEach((cat, i) => {
      doc.fontSize(11).text(`${cat}: $${data.ventasPorCategoria.valores[i]}`);
    });

    doc.moveDown(2);
    doc.text('Generado automáticamente por el Sistema Botitas.', { align: 'right', italic: true });

    doc.end();
  });
};

