// src/models/reportesModel.js
const db = require('../db/db');

function buildBetweenDateFilter(field, inicio, fin, params, withWhere = true) {
  if (inicio && fin) {
    params.push(inicio, fin);
    return `${withWhere ? 'WHERE' : 'AND'} DATE(${field}) BETWEEN ? AND ?`;
  }
  return '';
}

const reportesModel = {
  obtenerIndicadores: (inicio, fin, callback) => {
    const resultados = {};

    // -----------------------------
    // 1) KPIs generales (CORREGIDOS)
    // TicketPromedio = ventasTotales / cantidadVentas
    // -----------------------------
    const kpiParams = [];
    const kpiWhere = buildBetweenDateFilter('v.Fecha', inicio, fin, kpiParams, false);

    const kpiQuery = `
      SELECT
        ROUND(COALESCE(SUM(dv.ValorTotal),0),2) AS ventasTotales,
        COUNT(DISTINCT v.VentaID) AS cantidadVentas,
        ROUND(COALESCE(SUM(p.PrecioCosto * dv.Cantidad),0),2) AS costoTotal,
        ROUND(COALESCE(SUM(dv.ValorTotal - (p.PrecioCosto * dv.Cantidad)),0),2) AS gananciaBruta,
        ROUND(COALESCE(SUM(dv.Cantidad),0),2) AS unidadesVendidas
      FROM ventas v
      JOIN detalleventas dv ON v.VentaID = dv.VentaID
      JOIN productos p ON dv.ProductoID = p.ProductoID
      WHERE v.Estado <> 'Anulada'
      ${kpiWhere};
    `;

    // -----------------------------
    // 2) Comparativo (hoy/ayer/semana/mes)
    // (se mantiene global; si quieres filtrado por rango lo ajustamos)
    // -----------------------------
    const comparativoDias = `
      SELECT 
        ROUND(SUM(CASE WHEN DATE(v.Fecha) = CURDATE() THEN dv.ValorTotal ELSE 0 END),2) AS hoy,
        ROUND(SUM(CASE WHEN DATE(v.Fecha) = CURDATE() - INTERVAL 1 DAY THEN dv.ValorTotal ELSE 0 END),2) AS ayer,
        ROUND(SUM(CASE WHEN WEEK(v.Fecha,1) = WEEK(CURDATE(),1) AND YEAR(v.Fecha)=YEAR(CURDATE()) THEN dv.ValorTotal ELSE 0 END),2) AS semanaActual,
        ROUND(SUM(CASE WHEN WEEK(v.Fecha,1) = WEEK(CURDATE(),1) - 1 AND YEAR(v.Fecha)=YEAR(CURDATE()) THEN dv.ValorTotal ELSE 0 END),2) AS semanaAnterior,
        ROUND(SUM(CASE WHEN MONTH(v.Fecha) = MONTH(CURDATE()) AND YEAR(v.Fecha)=YEAR(CURDATE()) THEN dv.ValorTotal ELSE 0 END),2) AS mesActual,
        ROUND(SUM(CASE WHEN MONTH(v.Fecha) = MONTH(CURDATE()) - 1 AND YEAR(v.Fecha)=YEAR(CURDATE()) THEN dv.ValorTotal ELSE 0 END),2) AS mesAnterior
      FROM ventas v
      JOIN detalleventas dv ON v.VentaID = dv.VentaID
      WHERE v.Estado <> 'Anulada';
    `;

    // -----------------------------
    // 3) Ventas por mes (timeline)
    // -----------------------------
    const vmesParams = [];
    const vmesWhere = buildBetweenDateFilter('v.Fecha', inicio, fin, vmesParams, false);

    const ventasPorMes = `
      SELECT DATE_FORMAT(v.Fecha, '%Y-%m') AS mes, ROUND(SUM(dv.ValorTotal),2) AS total
      FROM ventas v
      JOIN detalleventas dv ON v.VentaID = dv.VentaID
      WHERE v.Estado <> 'Anulada'
      ${vmesWhere}
      GROUP BY mes
      ORDER BY mes ASC;
    `;

    // -----------------------------
    // 4) Ventas por categoría (tipo)
    // -----------------------------
    const vcatParams = [];
    const vcatWhere = buildBetweenDateFilter('v.Fecha', inicio, fin, vcatParams, false);

    const ventasPorCategoria = `
      SELECT t.Nombre AS categoria, ROUND(SUM(dv.ValorTotal),2) AS total
      FROM detalleventas dv
      JOIN ventas v ON dv.VentaID = v.VentaID
      JOIN productos p ON dv.ProductoID = p.ProductoID
      JOIN categorias c ON p.CategoriaID = c.CategoriaID
      JOIN tipos t ON c.TipoID = t.TipoID
      WHERE v.Estado <> 'Anulada'
      ${vcatWhere}
      GROUP BY t.Nombre
      ORDER BY total DESC;
    `;

    // -----------------------------
    // 5) Stock por categoría (CORREGIDO: variantes_producto)
    // -----------------------------
    const stockPorCategoria = `
      SELECT t.Nombre AS tipo, COALESCE(SUM(vp.Stock),0) AS stock
      FROM variantes_producto vp
      JOIN productos p ON vp.ProductoID = p.ProductoID
      JOIN categorias c ON p.CategoriaID = c.CategoriaID
      JOIN tipos t ON c.TipoID = t.TipoID
      GROUP BY t.Nombre
      ORDER BY stock DESC;
    `;

    // -----------------------------
    // 6) Clientes nuevos vs recurrentes (global)
    // -----------------------------
    const clientesSegmento = `
      SELECT 
        COUNT(DISTINCT CASE WHEN sub.cant_ventas = 1 THEN sub.ClienteID END) AS nuevos,
        COUNT(DISTINCT CASE WHEN sub.cant_ventas > 1 THEN sub.ClienteID END) AS recurrentes
      FROM (
        SELECT v.ClienteID, COUNT(v.VentaID) AS cant_ventas
        FROM ventas v
        WHERE v.ClienteID IS NOT NULL AND v.Estado <> 'Anulada'
        GROUP BY v.ClienteID
      ) AS sub;
    `;

    // -----------------------------
    // 7) Formas de pago
    // -----------------------------
    const pagosParams = [];
    const pagosWhere = buildBetweenDateFilter('v.Fecha', inicio, fin, pagosParams, false);

    const formasDePago = `
      SELECT v.FormaDePago, ROUND(SUM(dv.ValorTotal),2) AS total
      FROM ventas v
      JOIN detalleventas dv ON v.VentaID = dv.VentaID
      WHERE v.Estado <> 'Anulada'
      ${pagosWhere}
      GROUP BY v.FormaDePago
      ORDER BY total DESC;
    `;

    // -----------------------------
    // 8) Ventas por ciudad (top 6)
    // -----------------------------
    const ciudadParams = [];
    const ciudadWhere = buildBetweenDateFilter('v.Fecha', inicio, fin, ciudadParams, false);

    const ventasPorCiudad = `
      SELECT 
        IFNULL(NULLIF(UPPER(TRIM(SUBSTRING_INDEX(c.Direccion, ',', -1))), ''), 'SIN CIUDAD') AS ciudad,
        COUNT(DISTINCT v.VentaID) AS cantidadVentas,
        ROUND(SUM(dv.ValorTotal), 2) AS total
      FROM ventas v
      JOIN clientes c ON v.ClienteID = c.ClienteID
      JOIN detalleventas dv ON v.VentaID = dv.VentaID
      WHERE v.Estado <> 'Anulada'
      ${ciudadWhere}
      GROUP BY ciudad
      ORDER BY total DESC
      LIMIT 6;
    `;

    // -----------------------------
    // 9) Top productos (unidades)
    // -----------------------------
    const topParams = [];
    const topWhere = buildBetweenDateFilter('v.Fecha', inicio, fin, topParams, false);

    const topProductos = `
      SELECT p.Nombre, SUM(dv.Cantidad) AS cantidad
      FROM detalleventas dv
      JOIN ventas v ON dv.VentaID = v.VentaID
      JOIN productos p ON dv.ProductoID = p.ProductoID
      WHERE v.Estado <> 'Anulada'
      ${topWhere}
      GROUP BY p.Nombre
      ORDER BY cantidad DESC
      LIMIT 7;
    `;

    // -----------------------------
    // 10) Rotación global (REAL, simple)
    // salidasPeriodo / stockActualTotal
    // -----------------------------
    const rotParams = [];
    const rotWhere = buildBetweenDateFilter('ms.Fecha', inicio, fin, rotParams, false);

    const rotacionInventario = `
      SELECT
        ROUND(
          COALESCE(SUM(CASE WHEN ms.Tipo='SALIDA' THEN ms.Cantidad ELSE 0 END),0)
          / NULLIF((SELECT SUM(Stock) FROM variantes_producto),0)
        ,4) AS rotacionPromedio
      FROM movimientos_stock ms
      ${inicio && fin ? `WHERE DATE(ms.Fecha) BETWEEN ? AND ?` : ''};
    `;

    // -----------------------------
    // 11) Rotación por variante (TOP salidas)
    // -----------------------------
    const rotVarParams = [];
    const rotVarWhere = buildBetweenDateFilter('ms.Fecha', inicio, fin, rotVarParams, false);

    const rotacionVariantesTop = `
      SELECT 
        vp.VarianteID,
        p.Codigo,
        p.Nombre,
        t.Valor AS Talla,
        c.Nombre AS Color,
        m.Nombre AS Material,
        vp.Stock AS StockActual,
        COALESCE(SUM(CASE WHEN ms.Tipo='SALIDA' THEN ms.Cantidad END),0) AS TotalSalidas,
        MAX(CASE WHEN ms.Tipo='SALIDA' THEN ms.Fecha END) AS UltimaSalida
      FROM variantes_producto vp
      JOIN productos p ON vp.ProductoID = p.ProductoID
      JOIN tallas t ON vp.TallaID = t.TallaID
      JOIN colores c ON vp.ColorID = c.ColorID
      JOIN materiales m ON vp.MaterialID = m.MaterialID
      LEFT JOIN movimientos_stock ms ON vp.VarianteID = ms.VarianteID
      ${inicio && fin ? `WHERE DATE(ms.Fecha) BETWEEN ? AND ?` : ''}
      GROUP BY vp.VarianteID
      ORDER BY TotalSalidas DESC
      LIMIT 10;
    `;

    // -----------------------------
    // 12) Variantes estancadas (stock>0 y sin salida reciente)
    // default: 60 días (puedes cambiar en controller si quieres)
    // -----------------------------
    const estancadasParams = [60];
    const estancadasQuery = `
      SELECT 
        vp.VarianteID,
        p.Codigo,
        p.Nombre,
        t.Valor AS Talla,
        c.Nombre AS Color,
        m.Nombre AS Material,
        vp.Stock AS StockActual,
        MAX(CASE WHEN ms.Tipo='SALIDA' THEN ms.Fecha END) AS UltimaSalida,
        CASE 
          WHEN MAX(CASE WHEN ms.Tipo='SALIDA' THEN ms.Fecha END) IS NULL THEN 9999
          ELSE DATEDIFF(CURDATE(), DATE(MAX(CASE WHEN ms.Tipo='SALIDA' THEN ms.Fecha END)))
        END AS DiasSinSalida
      FROM variantes_producto vp
      JOIN productos p ON vp.ProductoID = p.ProductoID
      JOIN tallas t ON vp.TallaID = t.TallaID
      JOIN colores c ON vp.ColorID = c.ColorID
      JOIN materiales m ON vp.MaterialID = m.MaterialID
      LEFT JOIN movimientos_stock ms ON vp.VarianteID = ms.VarianteID
      WHERE vp.Stock > 0
      GROUP BY vp.VarianteID
      HAVING DiasSinSalida >= ?
      ORDER BY DiasSinSalida DESC
      LIMIT 12;
    `;

    // -----------------------------
    // 13) Temporada: ventas por MES del año (1-12)
    // -----------------------------
    const tempMesParams = [];
    const tempMesWhere = buildBetweenDateFilter('v.Fecha', inicio, fin, tempMesParams, false);

    const ventasTemporadaMes = `
      SELECT 
        MONTH(v.Fecha) AS mesNum,
        ROUND(SUM(dv.ValorTotal),2) AS total,
        COUNT(DISTINCT v.VentaID) AS cantidadVentas
      FROM ventas v
      JOIN detalleventas dv ON v.VentaID = dv.VentaID
      WHERE v.Estado <> 'Anulada'
      ${tempMesWhere}
      GROUP BY mesNum
      ORDER BY mesNum ASC;
    `;

    // -----------------------------
    // 14) Temporada: ventas por DÍA de semana (0=Lun .. 6=Dom)
    // WEEKDAY() => 0 lunes
    // -----------------------------
    const tempSemanaParams = [];
    const tempSemanaWhere = buildBetweenDateFilter('v.Fecha', inicio, fin, tempSemanaParams, false);

    const ventasTemporadaSemana = `
      SELECT 
        WEEKDAY(v.Fecha) AS diaNum,
        ROUND(SUM(dv.ValorTotal),2) AS total,
        COUNT(DISTINCT v.VentaID) AS cantidadVentas
      FROM ventas v
      JOIN detalleventas dv ON v.VentaID = dv.VentaID
      WHERE v.Estado <> 'Anulada'
      ${tempSemanaWhere}
      GROUP BY diaNum
      ORDER BY diaNum ASC;
    `;

    // ==========================================================
    // EJECUCIÓN SECUENCIAL (mantengo tu estilo, pero con params)
    // ==========================================================
    db.query(kpiQuery, kpiParams, (err, kpiRows) => {
      if (err) return callback(err);

      const kpi = kpiRows?.[0] || {};
      const ventasTotales = Number(kpi.ventasTotales || 0);
      const cantidadVentas = Number(kpi.cantidadVentas || 0);

      // KPI extra calculado (ticket promedio real + margen)
      kpi.ticketPromedio = cantidadVentas ? Number((ventasTotales / cantidadVentas).toFixed(2)) : 0;
      kpi.margenPorcentaje = ventasTotales ? Number(((Number(kpi.gananciaBruta || 0) / ventasTotales) * 100).toFixed(2)) : 0;
      resultados.kpi = kpi;

      db.query(comparativoDias, (err, compRows) => {
        if (err) return callback(err);
        resultados.comparativo = compRows?.[0] || {};

        db.query(ventasPorMes, vmesParams, (err, vmesRows) => {
          if (err) return callback(err);
          resultados.ventasPorMes = {
            labels: vmesRows.map(v => v.mes),
            valores: vmesRows.map(v => Number(v.total))
          };

          db.query(ventasPorCategoria, vcatParams, (err, vcatRows) => {
            if (err) return callback(err);
            resultados.ventasPorCategoria = {
              labels: vcatRows.map(x => x.categoria),
              valores: vcatRows.map(x => Number(x.total))
            };

            db.query(stockPorCategoria, (err, stockRows) => {
              if (err) return callback(err);
              resultados.stockPorCategoria = {
                labels: stockRows.map(s => s.tipo),
                valores: stockRows.map(s => Number(s.stock))
              };

              db.query(clientesSegmento, (err, cliRows) => {
                if (err) return callback(err);
                resultados.clientesSegmento = cliRows?.[0] || { nuevos: 0, recurrentes: 0 };

                db.query(formasDePago, pagosParams, (err, pagosRows) => {
                  if (err) return callback(err);
                  resultados.formasDePago = {
                    labels: pagosRows.map(p => p.FormaDePago),
                    valores: pagosRows.map(p => Number(p.total))
                  };

                  db.query(ventasPorCiudad, ciudadParams, (err, ciudadRows) => {
                    if (err) return callback(err);
                    resultados.ventasPorCiudad = {
                      labels: ciudadRows.map(c => c.ciudad || 'SIN CIUDAD'),
                      valores: ciudadRows.map(c => ({
                        total: Number(c.total),
                        cantidadVentas: Number(c.cantidadVentas)
                      }))
                    };

                    db.query(topProductos, topParams, (err, topRows) => {
                      if (err) return callback(err);
                      resultados.topProductos = {
                        labels: topRows.map(p => p.Nombre),
                        valores: topRows.map(p => Number(p.cantidad))
                      };

                      // rotación global real
                      const rotAllParams = inicio && fin ? rotParams : [];
                      db.query(rotacionInventario, rotAllParams, (err, rotRows) => {
                        if (err) return callback(err);
                        resultados.rotacionInventario = rotRows?.[0] || { rotacionPromedio: 0 };

                        // rotación por variante TOP
                        const rotVarAllParams = inicio && fin ? rotVarParams : [];
                        db.query(rotacionVariantesTop, rotVarAllParams, (err, rotVarRows) => {
                          if (err) return callback(err);
                          resultados.rotacionVariantesTop = rotVarRows || [];

                          // estancadas
                          db.query(estancadasQuery, estancadasParams, (err, estRows) => {
                            if (err) return callback(err);
                            resultados.variantesEstancadas = estRows || [];

                            // temporada mes
                            db.query(ventasTemporadaMes, tempMesParams, (err, tmRows) => {
                              if (err) return callback(err);
                              resultados.temporadaMes = tmRows || [];

                              // temporada semana
                              db.query(ventasTemporadaSemana, tempSemanaParams, (err, tsRows) => {
                                if (err) return callback(err);
                                resultados.temporadaSemana = tsRows || [];

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
          });
        });
      });
    });
  }
};

module.exports = reportesModel;
