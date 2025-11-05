const Inventario = require('../models/inventarioModel');

// ======================================================
// 📋 RENDERIZAR PÁGINA PRINCIPAL DE INVENTARIO
// ======================================================
exports.getInventarioPage = (req, res) => {
    const q = req.query.q || ''; // 🔍 obtiene el texto del buscador (si existe)

    Inventario.getAllProductos((err, productos) => {
        if (err) {
            console.error('❌ Error al cargar inventario:', err);
            return res.status(500).send('Error al cargar inventario.');
        }

        // 🔎 Si hay búsqueda, filtra los productos en memoria (puedes luego optimizarlo en SQL)
        const productosFiltrados = q
            ? productos.filter(p =>
                (p.Codigo && p.Codigo.toLowerCase().includes(q.toLowerCase())) ||
                (p.Nombre && p.Nombre.toLowerCase().includes(q.toLowerCase())) ||
                (p.Color && p.Color.toLowerCase().includes(q.toLowerCase()))
            )
            : productos;

        res.render('inventario/verInventario', {
            productos: productosFiltrados,
            q // ✅ envía la variable q para que EJS la reconozca
        });
    });
};
// ======================================================
// 🔍 BUSCADOR EN TIEMPO REAL (con imágenes y sugerencias)
// ======================================================
exports.searchProductos = (req, res) => {
    const texto = (req.query.texto || '').trim();
    if (!texto) return res.json([]);

    const sql = `
        SELECT 
            p.Codigo,
            p.Nombre,
            p.Foto,
            p.Cantidad,
            t.Valor AS Talla,
            c.Nombre AS Color,
            tp.Nombre AS Tipo,
            m.Nombre AS Material
        FROM productos p
        LEFT JOIN categorias cat ON p.CategoriaID = cat.CategoriaID
        LEFT JOIN tipos tp ON cat.TipoID = tp.TipoID
        LEFT JOIN materiales m ON cat.MaterialID = m.MaterialID
        LEFT JOIN colores c ON cat.ColorID = c.ColorID
        LEFT JOIN tallas t ON p.TallaID = t.TallaID
        WHERE 
            p.Codigo LIKE CONCAT('%', ?, '%')
            OR p.Nombre LIKE CONCAT('%', ?, '%')
            OR c.Nombre LIKE CONCAT('%', ?, '%')
            OR tp.Nombre LIKE CONCAT('%', ?, '%')
            OR m.Nombre LIKE CONCAT('%', ?, '%')
        ORDER BY p.Codigo ASC
        LIMIT 10;
    `;

    Inventario.query(sql, [texto, texto, texto, texto, texto], (err, results) => {
        if (err) {
            console.error('❌ Error al buscar productos:', err.sqlMessage || err);
            return res.status(500).json({ error: 'Error al buscar productos.' });
        }

        // ✅ Devuelve JSON limpio para el frontend
        res.json(results || []);
    });
};



// ======================================================
// 🧱 RENDERIZAR FORMULARIO PARA AGREGAR STOCK
// ======================================================
exports.getAgregarProductoPage = (req, res) => {
    Inventario.getAllTallas((err, tallas) => {
        if (err) return res.status(500).send('Error al obtener tallas');
        Inventario.getAllUbicaciones((err, ubicaciones) => {
            if (err) return res.status(500).send('Error al obtener ubicaciones');
            res.render('inventario/agregarProducto', {
                tallas,
                ubicaciones,
                error: null
            });
        });
    });
};

// ======================================================
// 🔍 VERIFICAR CÓDIGO (para autocompletar producto)
// ======================================================
exports.checkCodigo = (req, res) => {
    const { codigo } = req.body;
    if (!codigo) return res.json({ exists: false });

    Inventario.getProductoByCodigo(codigo, (err, producto) => {
        if (err) {
            console.error('❌ Error al buscar producto:', err);
            return res.status(500).json({ exists: false, error: 'Error al buscar producto' });
        }
        if (!producto) {
            return res.json({ exists: false });
        }
        res.json({ exists: true, producto });
    });
};
// ======================================================
// 🔍 BUSCAR PRODUCTOS POR CÓDIGO BASE
// ======================================================
exports.checkCodigo = (req, res) => {
    const { codigo } = req.body;
    if (!codigo) return res.json({ exists: false });

    Inventario.getProductosByCodigoBase(codigo, (err, productos) => {
        if (err) {
            console.error('❌ Error al buscar productos base:', err);
            return res.status(500).json({ exists: false });
        }

        if (!productos || productos.length === 0) {
            return res.json({ exists: false });
        }

        // todos comparten mismo prefijo, así que devolvemos lista
        res.json({ exists: true, productos });
    });
};

// ======================================================
// ➕ RESTOCK MÚLTIPLE DE VARIAS TALLAS
// ======================================================
exports.addProducto = (req, res) => {
    const body = req.body;
    const { PrecioCosto, IDFactura } = body;

    const productos = Object.keys(body)
        .filter(k => k.startsWith('talla_')) // ej: talla_36, talla_37
        .map(k => ({
            Codigo: k.replace('talla_', ''),
            CantidadAgregar: parseInt(body[k]) || 0,
            PrecioCosto
        }))
        .filter(p => p.CantidadAgregar > 0);

    if (productos.length === 0) {
        return res.status(400).send('No hay tallas para actualizar.');
    }

    Inventario.updateMultipleStocks(productos, (err) => {
        if (err) {
            console.error('❌ Error al actualizar múltiples stocks:', err);
            return res.status(500).send('Error al actualizar el stock.');
        }

        console.log(`✅ Restock actualizado para ${productos.length} tallas.`);
        res.redirect('/inventario');
    });
};
// ======================================================
// 🆕 AGREGAR NUEVA TALLA A PRODUCTO EXISTENTE
// ======================================================
exports.addNuevaTalla = (req, res) => {
    const { codigoBase, TallaID, Cantidad, PrecioCosto } = req.body;

    if (!codigoBase || !TallaID || !Cantidad || !PrecioCosto) {
        return res.status(400).send('Faltan datos para agregar nueva talla.');
    }

    Inventario.agregarNuevaTalla(codigoBase, TallaID, Cantidad, PrecioCosto, (err) => {
        if (err) {
            console.error('❌ Error al agregar nueva talla:', err);
            return res.status(500).send('Error al agregar nueva talla: ' + err.message);
        }
        console.log(`✅ Nueva talla ${TallaID} agregada a ${codigoBase}`);
        res.redirect('/inventario/agregar');
    });
};
