// src/routes/reportesRoutes.js
const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

// Dashboard visual
router.get('/dashboard', reportesController.getDashboard);

// Datos JSON
router.get('/general', reportesController.getDatosDashboard);

// Exportaciones
router.get('/exportar/excel', reportesController.exportarExcel);
router.get('/exportar/pdf', reportesController.exportarPDF);
// Comparativo dinámico AJAX
router.get('/comparar', reportesController.getComparativoInteractivo);

// Redirección a dashboard
router.get('/', (req, res) => res.redirect('/reportes/dashboard'));

module.exports = router;
