const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// Página principal de inventario
router.get('/', inventarioController.getInventarioPage);

// Página para agregar stock
router.get('/agregar', inventarioController.getAgregarProductoPage);
//ruta para buscar productos
router.get('/search', inventarioController.searchProductos);


// ✅ Acción para agregar stock (POST)
router.post('/agregar', inventarioController.addProducto);

// ✅ Buscar producto por código (para autocompletar)
router.post('/checkCodigo', inventarioController.checkCodigo);

// ✅ Agregar nueva talla directamente desde el restock
router.post('/agregar-talla', inventarioController.addNuevaTalla);

module.exports = router;
