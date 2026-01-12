// models/inventarioModel.js
const db = require('../db/db');
const crypto = require('crypto');

const Inventario = {};

/* =====================================================
   🔍 AUTOCOMPLETE PRODUCTOS + VARIANTES
===================================================== */
Inventario.autocompleteProductos = (texto, callback) => {
  const sql = `
    SELECT 
      p.ProductoID,
      p.Codigo,
      p.Nombre,
      p.Foto AS Foto,

      v.VarianteID,
      v.Stock,

      t.TallaID,
      t.Valor AS Talla,

      c.ColorID,
      c.Nombre AS Color,

      m.MaterialID,
      m.Nombre AS Material,

      u.UbicacionID,
      u.Nombre AS Ubicacion

    FROM productos p
    LEFT JOIN variantes_producto v ON p.ProductoID = v.ProductoID
    LEFT JOIN tallas t ON v.TallaID = t.TallaID
    LEFT JOIN colores c ON v.ColorID = c.ColorID
    LEFT JOIN materiales m ON v.MaterialID = m.MaterialID
    LEFT JOIN ubicaciones u ON v.UbicacionID = u.UbicacionID

    WHERE p.Codigo LIKE CONCAT('%', ?, '%')
       OR p.Nombre LIKE CONCAT('%', ?, '%')

    ORDER BY p.Codigo ASC
    LIMIT 50
  `;

  db.query(sql, [texto, texto], callback);
};

/* =====================================================
   🔍 OBTENER PRODUCTO BASE POR CÓDIGO
===================================================== */
Inventario.getProductoByCodigo = (codigo, callback) => {
  const sql = `
    SELECT ProductoID, Codigo, Nombre
    FROM productos
    WHERE Codigo = ?
    LIMIT 1
  `;
  db.query(sql, [codigo], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows?.[0] || null);
  });
};
/* =====================================================
   🔍 OBTENER VARIANTES POR CÓDIGO DE PRODUCTO
===================================================== */
Inventario.obtenerVariantesPorCodigo = (codigo, callback) => {
  const sql = `
    SELECT 
      v.VarianteID,
      t.Valor AS Talla,
      c.Nombre AS Color,
      m.Nombre AS Material,
      v.Stock
    FROM variantes_producto v
    JOIN productos p ON p.ProductoID = v.ProductoID
    JOIN tallas t ON t.TallaID = v.TallaID
    LEFT JOIN colores c ON c.ColorID = v.ColorID
    LEFT JOIN materiales m ON m.MaterialID = v.MaterialID
    WHERE p.Codigo = ?
    ORDER BY t.Valor
  `;

  db.query(sql, [codigo], callback);
};
/* =====================================================
   📦 INVENTARIO GENERAL ENRIQUECIDO
===================================================== */
Inventario.obtenerInventarioGeneral = (callback) => {
  const sql = `
    SELECT
      p.ProductoID,
      p.Codigo,
      p.Nombre,
      p.PrecioVenta,
      p.Estado,
      p.Foto AS Foto,

      tps.Nombre AS Tipo,
      g.Nombre AS Genero,

      v.VarianteID,
      ta.Valor AS Talla,
      c.Nombre AS Color,
      m.Nombre AS Material,
      u.Nombre AS Ubicacion,
      v.Stock

    FROM productos p
    JOIN categorias cat ON cat.CategoriaID = p.CategoriaID
    JOIN tipos tps ON tps.TipoID = cat.TipoID
    JOIN generos g ON g.GeneroID = cat.GeneroID

    LEFT JOIN variantes_producto v ON v.ProductoID = p.ProductoID
    LEFT JOIN tallas ta ON ta.TallaID = v.TallaID
    LEFT JOIN colores c ON c.ColorID = v.ColorID
    LEFT JOIN materiales m ON m.MaterialID = v.MaterialID
    LEFT JOIN ubicaciones u ON u.UbicacionID = v.UbicacionID

    ORDER BY p.Codigo, ta.Valor
  `;

  db.query(sql, callback);
};


/* =====================================================
   🔍 BUSCAR VARIANTE EXISTENTE
===================================================== */
Inventario.getVarianteExistente = (data, callback) => {
  const sql = `
    SELECT VarianteID
    FROM variantes_producto
    WHERE ProductoID = ?
      AND TallaID = ?
      AND ColorID = ?
      AND MaterialID = ?
    LIMIT 1
  `;
  db.query(
    sql,
    [
      data.ProductoID,
      data.TallaID,
      data.ColorID,
      data.MaterialID
    ],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows?.[0] || null);
    }
  );
};


/* =====================================================
   ➕ CREAR NUEVA VARIANTE (SIN STOCK)
===================================================== */
Inventario.crearVariante = (data, callback) => {
  const sql = `
    INSERT INTO variantes_producto
    (ProductoID, TallaID, ColorID, MaterialID, UbicacionID, Stock, QrCode, CostoUnitario, PrecioVentaVariante)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
  `;

  const qrCode = crypto.randomBytes(16).toString('hex');

  db.query(
    sql,
    [
      data.ProductoID,
      data.TallaID,
      data.ColorID,
      data.MaterialID,
      data.UbicacionID || null,
      qrCode,
      data.CostoUnitario,
      data.PrecioVentaVariante
    ],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.insertId);
    }
  );
};

module.exports = Inventario;
