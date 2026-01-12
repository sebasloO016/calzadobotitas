// models/crearProductoModel.js (código completo actualizado)
const db = require('../db/db');
const crypto = require('crypto');

const CrearProducto = {};

// ======================================================
// 🔹 FUNCIONES BASE PARA CATEGORÍAS NORMALIZADAS
// ======================================================
CrearProducto.getAllTipos = (cb) => db.query('SELECT * FROM tipos', cb);
CrearProducto.getAllMateriales = (cb) => db.query('SELECT * FROM materiales', cb);
CrearProducto.getAllGeneros = (cb) => db.query('SELECT * FROM generos', cb);
CrearProducto.getAllColores = (cb) => db.query('SELECT * FROM colores', cb);
CrearProducto.getAllTallas = (cb) => db.query('SELECT * FROM tallas', cb);
CrearProducto.getAllUbicaciones = (cb) => db.query('SELECT * FROM ubicaciones', cb);

// 🔸 Buscar o crear la categoría combinada (solo Tipo y Genero)
CrearProducto.findOrCreateCategoria = (tipo, genero, callback) => {
    const selectQuery = `
        SELECT CategoriaID 
        FROM categorias 
        WHERE TipoID = ? AND GeneroID = ?
    `;
    db.query(selectQuery, [tipo, genero], (err, results) => {
        if (err) return callback(err);
        if (results.length > 0) return callback(null, results[0].CategoriaID);

        const insertQuery = `
            INSERT INTO categorias (TipoID, GeneroID)
            VALUES (?, ?)
        `;
        db.query(insertQuery, [tipo, genero], (err, res) => {
            if (err) return callback(err);
            callback(null, res.insertId);
        });
    });
};

// ======================================================
// 🔹 FUNCIONES EXISTENTES
// ======================================================
CrearProducto.crearCompraProveedor = (compra, callback) => {
    const q = `
        INSERT INTO compras_proveedor 
        (ProveedorID, FechaCompra, NumeroFactura, TotalCompra, EstadoPago)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(q, [
        compra.ProveedorID,
        compra.FechaCompra,
        compra.NumeroFactura,
        compra.TotalCompra,
        compra.EstadoPago || 'Pendiente'
    ], callback);
};

CrearProducto.crearDetalleCompra = (detalle, callback) => {
    const q = `
        INSERT INTO detalle_compras 
        (CompraProveedorID, TallaID, Cantidad, CostoUnitario)
        VALUES (?, ?, ?, ?)
    `;
    db.query(q, [
        detalle.CompraProveedorID,
        detalle.TallaID,
        detalle.Cantidad,
        detalle.CostoUnitario
    ], callback);
};

CrearProducto.crearProducto = (producto, callback) => {
    const q = `
        INSERT INTO productos 
        (Codigo, Nombre, CategoriaID, Detalle, Foto, PrecioCosto, PrecioVenta)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(q, [
        producto.Codigo,
        producto.Nombre,
        producto.CategoriaID,
        producto.Detalle || null,
        producto.Foto || null,
        producto.PrecioCosto,
        producto.PrecioVenta
    ], callback);
};

CrearProducto.crearVariante = (variante, callback) => {
    const qrCode = crypto.randomBytes(16).toString('hex');
    const q = `
        INSERT INTO variantes_producto 
        (ProductoID, TallaID, ColorID, MaterialID, UbicacionID, Stock, QrCode, CostoUnitario, PrecioVentaVariante)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(q, [
        variante.ProductoID,
        variante.TallaID,
        variante.ColorID,
        variante.MaterialID,
        variante.UbicacionID || null,
        variante.Stock,
        qrCode,
        variante.CostoUnitario,
        variante.PrecioVentaVariante
    ], callback);
};

CrearProducto.actualizarVariante = (datos, callback) => {
    const sql = `
        UPDATE variantes_producto
        SET
            MaterialID = ?,
            UbicacionID = ?,
            Stock = ?,
            CostoUnitario = ?,
            PrecioVentaVariante = ?
        WHERE VarianteID = ?
    `;

    const params = [
        datos.MaterialID,
        datos.UbicacionID,
        datos.Stock,
        datos.CostoUnitario,
        datos.PrecioVentaVariante,
        datos.VarianteID
    ];

    db.query(sql, params, callback);
};



CrearProducto.eliminarVariante = (varianteId, callback) => {
    const q = 'DELETE FROM variantes_producto WHERE VarianteID = ?';
    db.query(q, [varianteId], callback);
};

CrearProducto.getAllDetalles = (callback) => {
    const query = `
        SELECT dc.*, t.Valor AS Talla, cp.CompraProveedorID
        FROM detalle_compras dc
        JOIN tallas t ON dc.TallaID = t.TallaID
        JOIN compras_proveedor cp ON dc.CompraProveedorID = cp.CompraProveedorID
    `;
    db.query(query, callback);
};

// ======================================================
// 🔍 Verificar si existe un producto por su código
// ======================================================
CrearProducto.getProductoByCodigo = (codigo, callback) => {
    const query = `
        SELECT p.*, c.TipoID, c.GeneroID, v.ColorID, v.MaterialID 
        FROM productos p 
        LEFT JOIN categorias c ON p.CategoriaID = c.CategoriaID 
        LEFT JOIN variantes_producto v ON p.ProductoID = v.ProductoID 
        WHERE p.Codigo = ? LIMIT 1
    `;
    db.query(query, [codigo], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results.length > 0 ? results[0] : null);
    });
};

CrearProducto.getVariantesByProductoId = (productoId, callback) => {
    const query = `
        SELECT v.*, t.Valor, u.Nombre AS UbicacionNombre 
        FROM variantes_producto v 
        JOIN tallas t ON v.TallaID = t.TallaID 
        LEFT JOIN ubicaciones u ON v.UbicacionID = u.UbicacionID 
        WHERE v.ProductoID = ?
    `;
    db.query(query, [productoId], callback);
};

CrearProducto.getAllProductos = (cb) => {
    const q = `
        SELECT p.*, tp.Nombre AS Tipo, g.Nombre AS Genero,
               GROUP_CONCAT(DISTINCT col.Nombre SEPARATOR ', ') AS Colores,
               GROUP_CONCAT(DISTINCT m.Nombre SEPARATOR ', ') AS Materiales,
               SUM(v.Stock) AS TotalStock,
               GROUP_CONCAT(DISTINCT t.Valor SEPARATOR ', ') AS Tallas,
               GROUP_CONCAT(DISTINCT u.Nombre SEPARATOR ', ') AS Ubicaciones
        FROM productos p
        LEFT JOIN categorias c ON p.CategoriaID = c.CategoriaID
        LEFT JOIN tipos tp ON c.TipoID = tp.TipoID
        LEFT JOIN generos g ON c.GeneroID = g.GeneroID
        LEFT JOIN variantes_producto v ON p.ProductoID = v.ProductoID
        LEFT JOIN colores col ON v.ColorID = col.ColorID
        LEFT JOIN materiales m ON v.MaterialID = m.MaterialID
        LEFT JOIN tallas t ON v.TallaID = t.TallaID
        LEFT JOIN ubicaciones u ON v.UbicacionID = u.UbicacionID
        GROUP BY p.ProductoID
    `;
    db.query(q, cb);
};

// ======================================================
// ✏️ ACTUALIZAR PRODUCTO
// ======================================================
CrearProducto.actualizarProducto = (codigo, producto, callback) => {
    const query = `
        UPDATE productos 
        SET Nombre=?, CategoriaID=?, Detalle=?, PrecioCosto=?, PrecioVenta=?, Foto=? 
        WHERE Codigo=?
    `;
    const values = [
        producto.Nombre,
        producto.CategoriaID,
        producto.Detalle,
        producto.PrecioCosto,
        producto.PrecioVenta,
        producto.Foto,
        codigo
    ];
    db.query(query, values, callback);
};

// ======================================================
// 🔁 CAMBIAR ESTADO ACTIVO / INACTIVO
// ======================================================
CrearProducto.cambiarEstado = (codigo, nuevoEstado, callback) => {
    const query = `UPDATE productos SET Estado = ? WHERE Codigo = ?`;
    db.query(query, [nuevoEstado, codigo], callback);
};


CrearProducto.registrarMovimientoStock = (mov, callback) => {
    const q = `
        INSERT INTO movimientos_stock
        (VarianteID, Tipo, Cantidad, Referencia)
        VALUES (?, ?, ?, ?)
    `;
    db.query(q, [
        mov.VarianteID,
        mov.Tipo,
        mov.Cantidad,
        mov.Referencia
    ], callback);
};


module.exports = CrearProducto;