const db = require('../db/db');

const Kardex = {};

// 1) Buscar variantes por código de producto (para seleccionar)
Kardex.getVariantesByCodigo = (codigo, callback) => {
    const sql = `
    SELECT 
      v.VarianteID,
      p.Codigo,
      p.Nombre,
      t.Valor AS Talla,
      c.Nombre AS Color,
      m.Nombre AS Material,
      v.Stock
    FROM productos p
    JOIN variantes_producto v ON p.ProductoID = v.ProductoID
    JOIN tallas t ON v.TallaID = t.TallaID
    JOIN colores c ON v.ColorID = c.ColorID
    JOIN materiales m ON v.MaterialID = m.MaterialID
    WHERE p.Codigo = ?
    ORDER BY t.Valor, c.Nombre, m.Nombre
  `;
    db.query(sql, [codigo], callback);
};

// 2) Cabecera de la variante (info del producto)
Kardex.getInfoVariante = (varianteId, callback) => {
    const sql = `
    SELECT 
      v.VarianteID,
      p.Codigo,
      p.Nombre,
      t.Valor AS Talla,
      c.Nombre AS Color,
      m.Nombre AS Material,
      v.Stock
    FROM variantes_producto v
    JOIN productos p ON v.ProductoID = p.ProductoID
    JOIN tallas t ON v.TallaID = t.TallaID
    JOIN colores c ON v.ColorID = c.ColorID
    JOIN materiales m ON v.MaterialID = m.MaterialID
    WHERE v.VarianteID = ?
    LIMIT 1
  `;
    db.query(sql, [varianteId], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows?.[0] || null);
    });
};
Kardex.getSaldoInicial = (varianteId, fechaDesde, callback) => {
    if (!fechaDesde) return callback(null, 0);

    const sql = `
    SELECT 
      COALESCE(SUM(
        CASE 
          WHEN Tipo = 'ENTRADA' THEN Cantidad
          ELSE -Cantidad
        END
      ), 0) AS SaldoInicial
    FROM movimientos_stock
    WHERE VarianteID = ?
      AND Fecha < ?
  `;
    db.query(sql, [varianteId, fechaDesde + ' 00:00:00'], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0].SaldoInicial);
    });
};
Kardex.getTotalesPeriodo = (varianteId, fechaDesde, fechaHasta, callback) => {
    const filtros = [];
    const params = [varianteId];

    if (fechaDesde) {
        filtros.push('Fecha >= ?');
        params.push(fechaDesde + ' 00:00:00');
    }
    if (fechaHasta) {
        filtros.push('Fecha <= ?');
        params.push(fechaHasta + ' 23:59:59');
    }

    const whereExtra = filtros.length ? 'AND ' + filtros.join(' AND ') : '';

    const sql = `
    SELECT
      SUM(CASE WHEN Tipo = 'ENTRADA' THEN Cantidad ELSE 0 END) AS Entradas,
      SUM(CASE WHEN Tipo = 'SALIDA' THEN Cantidad ELSE 0 END) AS Salidas
    FROM movimientos_stock
    WHERE VarianteID = ?
    ${whereExtra}
  `;
    db.query(sql, params, callback);
};



// 3) Kardex por variante con saldo acumulado (MySQL 8+)
Kardex.getKardexByVariante = (varianteId, fechaDesde, fechaHasta, callback) => {
    const filtros = [];
    const params = [varianteId];

    if (fechaDesde) {
        filtros.push(`ms.Fecha >= ?`);
        params.push(fechaDesde + ' 00:00:00');
    }
    if (fechaHasta) {
        filtros.push(`ms.Fecha <= ?`);
        params.push(fechaHasta + ' 23:59:59');
    }

    const whereExtra = filtros.length ? `AND ${filtros.join(' AND ')}` : '';

    const sql = `
    SELECT
      ms.MovimientoID,
      ms.Fecha,
      ms.Tipo,
      ms.Cantidad,
      ms.Referencia,
      SUM(
        CASE 
          WHEN ms.Tipo = 'ENTRADA' THEN ms.Cantidad
          ELSE -ms.Cantidad
        END
      ) OVER (ORDER BY ms.Fecha, ms.MovimientoID) AS SaldoAcumulado
    FROM movimientos_stock ms
    WHERE ms.VarianteID = ?
    ${whereExtra}
    ORDER BY ms.Fecha, ms.MovimientoID
  `;

    db.query(sql, params, callback);
};

module.exports = Kardex;
