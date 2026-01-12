// src/routes/reportesRoutes.js
const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

// Dashboard visual
router.get('/dashboard', reportesController.getDashboard);

// Datos JSON (para Chart.js)
router.get('/general', reportesController.getDatosDashboard);

// Comparativo dinámico AJAX (seguro)
router.get('/comparar', reportesController.getComparativoInteractivo);

// Exportaciones
router.get('/exportar/excel', reportesController.exportarExcel);
router.get('/exportar/pdf', reportesController.exportarPDF);

// Redirección a dashboard
router.get('/', (req, res) => res.redirect('/reportes/dashboard'));

module.exports = router;

