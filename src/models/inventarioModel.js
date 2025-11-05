const db = require('../db/db');
const Inventario = {};

// ======================================================
// 📦 OBTENER PRODUCTO POR CÓDIGO
// ======================================================
Inventario.getProductoByCodigo = (codigo, callback) => {
    const query = `
        SELECT p.*, 
               tp.Nombre AS Tipo, 
               m.Nombre AS Material, 
               g.Nombre AS Genero, 
               c.Nombre AS Color,
               t.Valor AS Talla,
               u.Nombre AS Ubicacion
        FROM productos p
        LEFT JOIN categorias cat ON p.CategoriaID = cat.CategoriaID
        LEFT JOIN tipos tp ON cat.TipoID = tp.TipoID
        LEFT JOIN materiales m ON cat.MaterialID = m.MaterialID
        LEFT JOIN generos g ON cat.GeneroID = g.GeneroID
        LEFT JOIN colores c ON cat.ColorID = c.ColorID
        LEFT JOIN tallas t ON p.TallaID = t.TallaID
        LEFT JOIN ubicaciones u ON p.UbicacionID = u.UbicacionID
        WHERE p.Codigo = ? LIMIT 1;
    `;
    db.query(query, [codigo], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0 ? results[0] : null);
    });
};

// ======================================================
// 📋 OBTENER TODOS LOS PRODUCTOS
// ======================================================
Inventario.getAllProductos = (callback) => {
    const query = `
        SELECT p.*, 
               tp.Nombre AS Tipo, 
               m.Nombre AS Material, 
               g.Nombre AS Genero, 
               c.Nombre AS Color,
               t.Valor AS Talla,
               u.Nombre AS Ubicacion
        FROM productos p
        LEFT JOIN categorias cat ON p.CategoriaID = cat.CategoriaID
        LEFT JOIN tipos tp ON cat.TipoID = tp.TipoID
        LEFT JOIN materiales m ON cat.MaterialID = m.MaterialID
        LEFT JOIN generos g ON cat.GeneroID = g.GeneroID
        LEFT JOIN colores c ON cat.ColorID = c.ColorID
        LEFT JOIN tallas t ON p.TallaID = t.TallaID
        LEFT JOIN ubicaciones u ON p.UbicacionID = u.UbicacionID;
    `;
    db.query(query, callback);
};

// ======================================================
// 📏 OBTENER TODAS LAS TALLAS
// ======================================================
Inventario.getAllTallas = (callback) => {
    db.query('SELECT * FROM tallas', callback);
};

// ======================================================
// 🗺️ OBTENER TODAS LAS UBICACIONES
// ======================================================
Inventario.getAllUbicaciones = (callback) => {
    db.query('SELECT * FROM ubicaciones', callback);
};

// ======================================================
// 🔄 ACTUALIZAR STOCK DE VARIAS TALLAS
// ======================================================
Inventario.updateMultipleStocks = (productos, callback) => {
  if (productos.length === 0) return callback(null);

  const actualizar = (i = 0) => {
    if (i >= productos.length) return callback(null);

    const p = productos[i];
    const cantidad = parseInt(p.CantidadAgregar) || 0;
    const precio = parseFloat(p.PrecioCosto) || 0;

    const query = `
      UPDATE productos 
      SET Cantidad = Cantidad + ?, PrecioCosto = ?
      WHERE Codigo = ?;
    `;

    db.query(query, [cantidad, precio, p.Codigo], (err) => {
      if (err) {
        console.error(`❌ Error al actualizar ${p.Codigo}:`, err);
        return callback(err);
      }
      actualizar(i + 1);
    });
  };

  actualizar();
};

// ======================================================
// 🔍 OBTENER PRODUCTOS POR CÓDIGO BASE (ej: "910")
// ======================================================
Inventario.getProductosByCodigoBase = (codigoBase, callback) => {
  const query = `
    SELECT 
      p.Codigo,
      p.Nombre,
      p.Cantidad,
      t.Valor AS Talla,
      tp.Nombre AS Tipo,
      m.Nombre AS Material,
      g.Nombre AS Genero,
      c.Nombre AS Color
    FROM productos p
    LEFT JOIN categorias cat ON p.CategoriaID = cat.CategoriaID
    LEFT JOIN tipos tp ON cat.TipoID = tp.TipoID
    LEFT JOIN materiales m ON cat.MaterialID = m.MaterialID
    LEFT JOIN generos g ON cat.GeneroID = g.GeneroID
    LEFT JOIN colores c ON cat.ColorID = c.ColorID
    LEFT JOIN tallas t ON p.TallaID = t.TallaID
    WHERE p.Codigo LIKE CONCAT(?, '-%');
  `;
  db.query(query, [codigoBase], callback);
};

// ======================================================
// 🆕 CREAR NUEVA TALLA PARA PRODUCTO EXISTENTE
// ======================================================
Inventario.agregarNuevaTalla = (codigoBase, tallaID, cantidad, precioCosto, callback) => {
    const queryBase = `
        SELECT * FROM productos 
        WHERE Codigo LIKE CONCAT(?, '-%') 
        LIMIT 1;
    `;
    db.query(queryBase, [codigoBase], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(new Error('No se encontró el producto base.'));

        const base = results[0];
        const nuevoCodigo = `${codigoBase}-${tallaID}`;

        db.query(`SELECT Codigo FROM productos WHERE Codigo = ?`, [nuevoCodigo], (err2, res2) => {
            if (err2) return callback(err2);
            if (res2.length > 0) return callback(new Error('Esta talla ya existe.'));

            const insertQuery = `
                INSERT INTO productos 
                (Codigo, Nombre, CategoriaID, TallaID, UbicacionID, Detalle, Foto, PrecioCosto, PrecioVenta, Cantidad, Estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo');
            `;

            const nuevoNombre = `${base.Nombre} Talla ${tallaID}`;
            const values = [
                nuevoCodigo,
                nuevoNombre,
                base.CategoriaID,
                tallaID,
                base.UbicacionID || null,
                base.Detalle || '',
                base.Foto || '',
                precioCosto,
                base.PrecioVenta,
                cantidad
            ];

            db.query(insertQuery, values, callback);
        });
    });
};

// ======================================================
// 💡 MÉTODO GENÉRICO PARA CONSULTAS SQL LIBRES
// ======================================================
Inventario.query = (sql, params, callback) => {
    db.query(sql, params, callback);
};

module.exports = Inventario;
