//rutas
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/', clientesController.getClientes);
router.get('/buscar', clientesController.buscarClientes);
router.get('/agregar', clientesController.mostrarFormularioAgregar); // New route
router.post('/agregar', clientesController.crearCliente);

module.exports = router;