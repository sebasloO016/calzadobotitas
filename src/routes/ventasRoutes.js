// routes/ventasRoutes.js
const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

/**
 * 🛒 SISTEMA DE PUNTOS DE VENTA (POS)
 * Estas rutas gestionan el flujo completo de la venta, clientes y productos.
 */

// ==========================================
// 🔸 VISTAS PRINCIPALES
// ==========================================

// Pantalla de Nueva Venta (El "Carrito" y Formulario de Cliente)
// Aquí es donde sucede la magia de la venta rápida.
router.get('/nueva', ventasController.getNuevaVenta);

// Historial de Ventas (Para revisar facturas pasadas y estados)
router.get('/historial', ventasController.getHistorialVentas);


// ==========================================
// 🔸 ACCIONES DE VENTA (POST)
// ==========================================

// Procesar la venta final (Transacción SQL, Stock, Cliente y Caja)
router.post('/nueva', ventasController.postNuevaVenta);

// Anular una venta (Revierte stock y cambia estado a 'Anulada')
router.post('/anular/:id', ventasController.anularVenta);


// ==========================================
// 🔸 API / ENDPOINTS DE APOYO (JSON)
// ==========================================

// Buscar Cliente por Cédula o RUC (Autocompletado)
// Si no existe, el frontend debería permitir crear uno nuevo.
router.get('/buscarCliente/:identificacion', ventasController.buscarCliente);

// Buscar Producto por Código de Barras o ID
// Retorna las variantes (talla/color) para agregar al carrito.
router.get('/buscarProducto/:codigo', ventasController.buscarProducto);

// Obtener el detalle técnico de una venta específica (Usado para Modales)
router.get('/detalle/:id', ventasController.getDetalleVenta);
// Imprimir ticket / factura
router.get('/imprimir/:id', ventasController.imprimirVenta);


module.exports = router;