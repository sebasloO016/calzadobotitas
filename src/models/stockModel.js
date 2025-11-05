const db = require('../db/db');
const Stock = {};

// ======================================================
// 🔍 BUSCAR PRODUCTO BASE Y SUS TALLAS
// ======================================================
Stock.getStockByCodigoBase = (codigoBase, callback) => {
    const sql = `
        SELECT 
            p.Codigo,
            p.Nombre,
            p.Cantidad,
            p.Foto,
            t.Valor AS Talla,
            u.Nombre AS Ubicacion,
            c.Nombre AS Color,
            tp.Nombre AS Tipo,
            m.Nombre AS Material
        FROM productos p
        LEFT JOIN categorias cat ON p.CategoriaID = cat.CategoriaID
        LEFT JOIN tipos tp ON cat.TipoID = tp.TipoID
        LEFT JOIN materiales m ON cat.MaterialID = m.MaterialID
        LEFT JOIN colores c ON cat.ColorID = c.ColorID
        LEFT JOIN tallas t ON p.TallaID = t.TallaID
        LEFT JOIN ubicaciones u ON p.UbicacionID = u.UbicacionID
        WHERE p.Codigo LIKE CONCAT(?, '-%')
        ORDER BY CAST(t.Valor AS UNSIGNED);
    `;

    db.query(sql, [codigoBase], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(null, null);

        // Totales agrupados
        const totalStock = results.reduce((sum, r) => sum + (r.Cantidad || 0), 0);

        const producto = {
            CodigoBase: codigoBase,
            Nombre: results[0].Nombre.split(' Talla')[0],
            Color: results[0].Color,
            Tipo: results[0].Tipo,
            Material: results[0].Material,
            Ubicacion: results[0].Ubicacion,
            Foto: results[0].Foto,
            TotalStock: totalStock,
            Tallas: results.map(r => ({ Talla: r.Talla, Cantidad: r.Cantidad }))
        };

        callback(null, producto);
    });
};

// ======================================================
// 🔍 AUTOCOMPLETADO GLOBAL (sin columna ProveedorID)
// ======================================================
Stock.getProductosAutocomplete = (texto, callback) => {
    const sql = `
        SELECT 
            p.Codigo,
            p.Nombre,
            p.Foto,
            c.Nombre AS Color,
            tp.Nombre AS Tipo,
            m.Nombre AS Material,
            g.Nombre AS Genero,
            u.Nombre AS Ubicacion,
            t.Valor AS Talla
        FROM productos p
        LEFT JOIN categorias cat ON p.CategoriaID = cat.CategoriaID
        LEFT JOIN tipos tp ON cat.TipoID = tp.TipoID
        LEFT JOIN materiales m ON cat.MaterialID = m.MaterialID
        LEFT JOIN generos g ON cat.GeneroID = g.GeneroID
        LEFT JOIN colores c ON cat.ColorID = c.ColorID
        LEFT JOIN ubicaciones u ON p.UbicacionID = u.UbicacionID
        LEFT JOIN tallas t ON p.TallaID = t.TallaID
        WHERE 
            p.Codigo LIKE CONCAT('%', ?, '%')
            OR p.Nombre LIKE CONCAT('%', ?, '%')
            OR c.Nombre LIKE CONCAT('%', ?, '%')
            OR tp.Nombre LIKE CONCAT('%', ?, '%')
            OR m.Nombre LIKE CONCAT('%', ?, '%')
            OR g.Nombre LIKE CONCAT('%', ?, '%')
            OR u.Nombre LIKE CONCAT('%', ?, '%')
            OR t.Valor LIKE CONCAT('%', ?, '%')
            OR EXISTS (
                SELECT 1 FROM proveedores pr 
                WHERE pr.Nombre LIKE CONCAT('%', ?, '%')
            )
        GROUP BY LEFT(p.Codigo, LOCATE('-', p.Codigo) - 1)
        ORDER BY p.Codigo ASC
        LIMIT 15;
    `;
    db.query(sql, [texto, texto, texto, texto, texto, texto, texto, texto, texto], callback);
};



module.exports = Stock;
