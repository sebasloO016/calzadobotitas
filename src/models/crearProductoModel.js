const db = require('../db/db');

const CrearProducto = {};

// ======================================================
// 🔹 FUNCIONES BASE PARA CATEGORÍAS NORMALIZADAS
// ======================================================
CrearProducto.getAllTipos = (cb) => db.query('SELECT * FROM tipos', cb);
CrearProducto.getAllMateriales = (cb) => db.query('SELECT * FROM materiales', cb);
CrearProducto.getAllGeneros = (cb) => db.query('SELECT * FROM generos', cb);
CrearProducto.getAllColores = (cb) => db.query('SELECT * FROM colores', cb);

// 🔸 Buscar o crear la categoría combinada
CrearProducto.findOrCreateCategoria = (tipo, material, genero, color, callback) => {
    const selectQuery = `
        SELECT CategoriaID 
        FROM categorias 
        WHERE TipoID = ? AND MaterialID = ? AND GeneroID = ? AND ColorID = ?
    `;
    db.query(selectQuery, [tipo, material, genero, color], (err, results) => {
        if (err) return callback(err);
        if (results.length > 0) return callback(null, results[0].CategoriaID);

        const insertQuery = `
            INSERT INTO categorias (TipoID, MaterialID, GeneroID, ColorID)
            VALUES (?, ?, ?, ?)
        `;
        db.query(insertQuery, [tipo, material, genero, color], (err, res) => {
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
        (Codigo, Nombre, CategoriaID, TallaID, UbicacionID, Detalle, Foto, PrecioCosto, PrecioVenta, Cantidad, DetalleCompraID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(q, [
        producto.Codigo,
        producto.Nombre,
        producto.CategoriaID,
        producto.TallaID || null,
        producto.UbicacionID || null,
        producto.Detalle || null,
        producto.Foto || null,
        producto.PrecioCosto,
        producto.PrecioVenta,
        producto.Cantidad || 0,
        producto.DetalleCompraID || null
    ], callback);
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
    const query = 'SELECT * FROM productos WHERE Codigo = ? LIMIT 1';
    db.query(query, [codigo], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results.length > 0 ? results[0] : null);
    });
};


CrearProducto.getAllProductos = (cb) => {
    const q = `
        SELECT p.*, tp.Nombre AS Tipo, m.Nombre AS Material, g.Nombre AS Genero, col.Nombre AS Color,
               t.Valor AS Talla, u.Nombre AS Ubicacion, pr.Nombre AS ProveedorNombre
        FROM productos p
        LEFT JOIN categorias c ON p.CategoriaID = c.CategoriaID
        LEFT JOIN tipos tp ON c.TipoID = tp.TipoID
        LEFT JOIN materiales m ON c.MaterialID = m.MaterialID
        LEFT JOIN generos g ON c.GeneroID = g.GeneroID
        LEFT JOIN colores col ON c.ColorID = col.ColorID
        LEFT JOIN tallas t ON p.TallaID = t.TallaID
        LEFT JOIN ubicaciones u ON p.UbicacionID = u.UbicacionID
        LEFT JOIN detalle_compras dc ON p.DetalleCompraID = dc.DetalleCompraID
        LEFT JOIN compras_proveedor cp ON dc.CompraProveedorID = cp.CompraProveedorID
        LEFT JOIN proveedores pr ON cp.ProveedorID = pr.ProveedorID
    `;
    db.query(q, cb);
};

CrearProducto.getAllTallas = (cb) => db.query('SELECT * FROM tallas', cb);
CrearProducto.getAllUbicaciones = (cb) => db.query('SELECT * FROM ubicaciones', cb);
// ======================================================
// ✏️ ACTUALIZAR PRODUCTO
// ======================================================
CrearProducto.actualizarProducto = (codigo, producto, callback) => {
    const query = `
        UPDATE productos 
        SET Nombre=?, CategoriaID=?, TallaID=?, UbicacionID=?, 
            Detalle=?, PrecioCosto=?, PrecioVenta=?, Cantidad=?, Foto=? 
        WHERE Codigo=?`;
    const values = [
        producto.Nombre,
        producto.CategoriaID,
        producto.TallaID,
        producto.UbicacionID,
        producto.Detalle,
        producto.PrecioCosto,
        producto.PrecioVenta,
        producto.Cantidad,
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


module.exports = CrearProducto;
