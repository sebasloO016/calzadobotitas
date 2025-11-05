const Stock = require('../models/stockModel');

// ======================================================
// 📋 RENDERIZAR PÁGINA PRINCIPAL DE STOCK
// ======================================================
exports.getStockPage = (req, res) => {
    res.render('inventario/stockUbicacion', { producto: null });
};

// ======================================================
// 🔍 OBTENER STOCK DETALLADO POR CÓDIGO BASE (ej: "910")
// ======================================================
exports.getStockByCodigo = (req, res) => {
    const { codigo } = req.query;
    if (!codigo) return res.render('inventario/stockUbicacion', { producto: null });

    Stock.getStockByCodigoBase(codigo, (err, producto) => {
        if (err) {
            console.error('❌ Error al buscar stock:', err);
            return res.render('inventario/stockUbicacion', { producto: null });
        }
        res.render('inventario/stockUbicacion', { producto });
    });
};

// ======================================================
// 🔎 AUTOCOMPLETADO (búsqueda visual con imágenes)
// ======================================================
exports.getProductosAutocomplete = (req, res) => {
    const { texto } = req.query;
    if (!texto) return res.json([]);

    Stock.getProductosAutocomplete(texto, (err, productos) => {
        if (err) {
            console.error('❌ Error en getProductosAutocomplete:', err);
            return res.status(500).json([]);
        }
        res.json(productos);
    });
};
