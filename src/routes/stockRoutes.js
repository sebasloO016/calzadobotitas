const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// ✅ Página principal
router.get('/', stockController.getStockPage);

// ✅ Buscar por código (muestra resultados)
router.get('/buscar', stockController.getStockByCodigo);

// ✅ Autocompletado AJAX
router.get('/buscar-autocomplete', stockController.getProductosAutocomplete);

module.exports = router;
