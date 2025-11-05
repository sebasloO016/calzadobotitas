// routes/ventasRoutes.js
const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

// Interfaz nueva venta
router.get('/nueva', ventasController.getNuevaVenta);

// Procesar venta
router.post('/nueva', ventasController.postNuevaVenta);

// Buscar cliente
router.get('/buscarCliente/:identificacion', ventasController.buscarCliente);

// Buscar producto
router.get('/buscarProducto/:codigo', ventasController.buscarProducto);

// ✅ Nueva ruta para mostrar el historial
router.get('/historial', ventasController.getHistorialVentas);

// Ver detalle de venta (usado por el modal)
router.get('/detalle/:id', ventasController.getDetalleVenta);

// Anular venta
router.post('/anular/:id', ventasController.anularVenta);

module.exports = router;
