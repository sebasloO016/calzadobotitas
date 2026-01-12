// models/stockModel.js
const db = require('../db/db');

const Stock = {};

/* =====================================================
   🔍 VARIANTE EXACTA POR QR (CASO VENDEDOR)
===================================================== */
Stock.getByQr = (qrCode, callback) => {
    const sql = `
    SELECT
      v.VarianteID,
      v.Stock,
      v.QrCode,

      p.Codigo,
      p.Nombre,
      p.Foto,
      p.PrecioVenta,

      t.Valor AS Talla,
      c.Nombre AS Color,
      m.Nombre AS Material,
      u.Nombre AS Ubicacion

    FROM variantes_producto v
    JOIN productos p ON p.ProductoID = v.ProductoID
    LEFT JOIN tallas t ON t.TallaID = v.TallaID
    LEFT JOIN colores c ON c.ColorID = v.ColorID
    LEFT JOIN materiales m ON m.MaterialID = v.MaterialID
    LEFT JOIN ubicaciones u ON u.UbicacionID = v.UbicacionID

    WHERE v.QrCode = ?
    LIMIT 1
  `;
    db.query(sql, [qrCode], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows?.[0] || null);
    });
};

/* =====================================================
   📦 TODAS LAS VARIANTES POR CÓDIGO (912, ETC)
===================================================== */
Stock.getVariantesByCodigo = (codigo, callback) => {
    const sql = `
    SELECT
      v.VarianteID,
      v.Stock,
      v.QrCode,

      p.Codigo,
      p.Nombre,
      p.Foto,
      p.PrecioVenta,

      t.Valor AS Talla,
      c.Nombre AS Color,
      m.Nombre AS Material,
      u.Nombre AS Ubicacion

    FROM productos p
    LEFT JOIN variantes_producto v ON v.ProductoID = p.ProductoID
    LEFT JOIN tallas t ON t.TallaID = v.TallaID
    LEFT JOIN colores c ON c.ColorID = v.ColorID
    LEFT JOIN materiales m ON m.MaterialID = v.MaterialID
    LEFT JOIN ubicaciones u ON u.UbicacionID = v.UbicacionID

    WHERE p.Codigo = ?
    ORDER BY t.Valor ASC
  `;
    db.query(sql, [codigo], callback);
};

/* =====================================================
   🔍 AUTOCOMPLETE PARA STOCK (AYUDA MANUAL)
===================================================== */
Stock.autocomplete = (texto, callback) => {
    const sql = `
    SELECT DISTINCT
      p.Codigo,
      p.Nombre,
      p.Foto,
      tps.Nombre AS Tipo,
      c.Nombre AS Color,
      m.Nombre AS Material,
      u.Nombre AS Ubicacion

    FROM productos p
    JOIN categorias cat ON cat.CategoriaID = p.CategoriaID
    JOIN tipos tps ON tps.TipoID = cat.TipoID
    LEFT JOIN variantes_producto v ON v.ProductoID = p.ProductoID
    LEFT JOIN colores c ON c.ColorID = v.ColorID
    LEFT JOIN materiales m ON m.MaterialID = v.MaterialID
    LEFT JOIN ubicaciones u ON u.UbicacionID = v.UbicacionID

    WHERE p.Codigo LIKE CONCAT('%', ?, '%')
       OR p.Nombre LIKE CONCAT('%', ?, '%')
       OR tps.Nombre LIKE CONCAT('%', ?, '%')
       OR c.Nombre LIKE CONCAT('%', ?, '%')
       OR m.Nombre LIKE CONCAT('%', ?, '%')
       OR u.Nombre LIKE CONCAT('%', ?, '%')

    ORDER BY p.Codigo
    LIMIT 15
  `;
    db.query(sql, [texto, texto, texto, texto, texto, texto], callback);
};

module.exports = Stock;
