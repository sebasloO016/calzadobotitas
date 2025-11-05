// src/models/reportesModel.js
const db = require('../db/db');

const reportesModel = {
  obtenerIndicadores: (inicio, fin, callback) => {
    const rango = inicio && fin ? `WHERE DATE(v.Fecha) BETWEEN '${inicio}' AND '${fin}'` : '';

    const resultados = {};

    // ==============================
    // 🔹 1. KPIs generales
    // ==============================
    const kpiQuery = `
      SELECT
        ROUND(SUM(dv.ValorTotal),2) AS ventasTotales,
        COUNT(DISTINCT v.VentaID) AS cantidadVentas,
        ROUND(SUM(p.PrecioCosto * dv.Cantidad),2) AS costoTotal,
        ROUND(SUM(dv.ValorTotal - (p.PrecioCosto * dv.Cantidad)),2) AS gananciaBruta,
        ROUND(SUM(dv.ValorTotal) * 0.15,2) AS ivaEstimado,
        ROUND(AVG(dv.ValorTotal),2) AS ticketPromedio
      FROM ventas v
      JOIN detalleventas dv ON v.VentaID = dv.VentaID
      JOIN productos p ON dv.ProductoID = p.ProductoID
      ${rango};
    `;

    // ==============================
    // 📅 2. Comparativo de periodos
    // ==============================
    const comparativoDias = `
      SELECT 
        ROUND(SUM(CASE WHEN DATE(v.Fecha) = CURDATE() THEN dv.ValorTotal ELSE 0 END),2) AS hoy,
        ROUND(SUM(CASE WHEN DATE(v.Fecha) = CURDATE() - INTERVAL 1 DAY THEN dv.ValorTotal ELSE 0 END),2) AS ayer,
        ROUND(SUM(CASE WHEN WEEK(v.Fecha) = WEEK(CURDATE()) THEN dv.ValorTotal ELSE 0 END),2) AS semanaActual,
        ROUND(SUM(CASE WHEN WEEK(v.Fecha) = WEEK(CURDATE()) - 1 THEN dv.ValorTotal ELSE 0 END),2) AS semanaAnterior,
        ROUND(SUM(CASE WHEN MONTH(v.Fecha) = MONTH(CURDATE()) THEN dv.ValorTotal ELSE 0 END),2) AS mesActual,
        ROUND(SUM(CASE WHEN MONTH(v.Fecha) = MONTH(CURDATE()) - 1 THEN dv.ValorTotal ELSE 0 END),2) AS mesAnterior
      FROM ventas v
      JOIN detalleventas dv ON v.VentaID = dv.VentaID;
    `;

    // ==============================
    // 📆 3. Ventas por mes
    // ==============================
    const ventasPorMes = `
    SELECT DATE_FORMAT(v.Fecha, '%Y-%m') AS mes, SUM(dv.ValorTotal) AS total
    FROM ventas v
    JOIN detalleventas dv ON v.VentaID = dv.VentaID
    ${rango}
    GROUP BY mes
    ORDER BY mes ASC;
    `;

    // ==============================
    // 👠 4. Ventas por categoría
    // ==============================
    const ventasPorCategoria = `
        SELECT t.Nombre AS categoria, SUM(dv.ValorTotal) AS total
        FROM detalleventas dv
        JOIN ventas v ON dv.VentaID = v.VentaID
        JOIN productos p ON dv.ProductoID = p.ProductoID
        JOIN categorias c ON p.CategoriaID = c.CategoriaID
        JOIN tipos t ON c.TipoID = t.TipoID
        ${rango}
        GROUP BY t.Nombre;
        `;

    // ==============================
    // 📦 5. Stock por categoría
    // ==============================
    const stockPorCategoria = `
      SELECT t.Nombre AS tipo, SUM(p.Cantidad) AS stock
      FROM productos p
      JOIN categorias c ON p.CategoriaID = c.CategoriaID
      JOIN tipos t ON c.TipoID = t.TipoID
      GROUP BY t.Nombre;
    `;

    // ==============================
    // 🧍‍♂️ 6. Clientes nuevos vs recurrentes
    // ==============================
    const clientesSegmento = `
      SELECT 
        COUNT(DISTINCT CASE WHEN sub.cant_ventas = 1 THEN sub.ClienteID END) AS nuevos,
        COUNT(DISTINCT CASE WHEN sub.cant_ventas > 1 THEN sub.ClienteID END) AS recurrentes
      FROM (
        SELECT v.ClienteID, COUNT(v.VentaID) AS cant_ventas
        FROM ventas v
        GROUP BY v.ClienteID
      ) AS sub;
    `;

    // ==============================
    // 💳 7. Formas de pago
    // ==============================
   const formasDePago = `
  SELECT v.FormaDePago, SUM(dv.ValorTotal) AS total
  FROM ventas v
  JOIN detalleventas dv ON v.VentaID = dv.VentaID
  ${rango}
  GROUP BY v.FormaDePago;
`;

    // ==============================
    // 🏙️ 8. Ventas por ciudad
    // ==============================
const ventasPorCiudad = `
  SELECT 
    IFNULL(NULLIF(UPPER(TRIM(SUBSTRING_INDEX(c.Direccion, ',', -1))), ''), 'SIN CIUDAD') AS ciudad,
    COUNT(DISTINCT v.VentaID) AS cantidadVentas,
    ROUND(SUM(dv.ValorTotal), 2) AS total
  FROM ventas v
  JOIN clientes c ON v.ClienteID = c.ClienteID
  JOIN detalleventas dv ON v.VentaID = dv.VentaID
  ${rango}
  GROUP BY ciudad
  ORDER BY total DESC
  LIMIT 6;
`;

    // ==============================
    // 📈 9. Productos más vendidos
    // ==============================
    const topProductos = `
      SELECT p.Nombre, SUM(dv.Cantidad) AS cantidad, SUM(dv.ValorTotal) AS total
      FROM detalleventas dv
      JOIN productos p ON dv.ProductoID = p.ProductoID
      GROUP BY p.Nombre
      ORDER BY cantidad DESC
      LIMIT 5;
    `;

    // ==============================
    // 🔄 10. Rotación de inventario
    // ==============================
    const rotacionInventario = `
      SELECT ROUND(SUM(dv.Cantidad)/COUNT(DISTINCT p.ProductoID),2) AS rotacionPromedio
      FROM detalleventas dv
      JOIN productos p ON dv.ProductoID = p.ProductoID;
    `;

    // ==============================
    // 🚀 Ejecutar secuencialmente
    // ==============================
    db.query(kpiQuery, (err, kpi) => {
      if (err) return callback(err);
      resultados.kpi = kpi[0] || {};

      db.query(comparativoDias, (err, comp) => {
        if (err) return callback(err);
        resultados.comparativo = comp[0] || {};

        db.query(ventasPorMes, (err, vmes) => {
          if (err) return callback(err);
          resultados.ventasPorMes = { labels: vmes.map(v => v.mes), valores: vmes.map(v => v.total) };

          db.query(ventasPorCategoria, (err, vcat) => {
            if (err) return callback(err);
            resultados.ventasPorCategoria = { labels: vcat.map(c => c.categoria), valores: vcat.map(c => c.total) };

            db.query(stockPorCategoria, (err, stock) => {
              if (err) return callback(err);
              resultados.stockPorCategoria = { labels: stock.map(s => s.tipo), valores: stock.map(s => s.stock) };

              db.query(clientesSegmento, (err, cli) => {
                if (err) return callback(err);
                resultados.clientesSegmento = cli[0];

                db.query(formasDePago, (err, pagos) => {
                  if (err) return callback(err);
                  resultados.formasDePago = { labels: pagos.map(f => f.FormaDePago), valores: pagos.map(f => f.total) };

                  db.query(ventasPorCiudad, (err, ciudad) => {
                        if (err) return callback(err);

                        resultados.ventasPorCiudad = { 
                            labels: ciudad.map(c => c.ciudad || 'SIN CIUDAD'), 
                            valores: ciudad.map(c => ({
                            total: c.total,
                            cantidadVentas: c.cantidadVentas
                            }))
                        };

                    db.query(topProductos, (err, top) => {
                      if (err) return callback(err);
                      resultados.topProductos = { labels: top.map(p => p.Nombre), valores: top.map(p => p.cantidad) };

                      db.query(rotacionInventario, (err, rot) => {
                        if (err) return callback(err);
                        resultados.rotacionInventario = rot[0];
                        callback(null, resultados);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }
};

module.exports = reportesModel;
