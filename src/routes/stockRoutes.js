// routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

/* =====================================================
   📄 VISTA BASE
===================================================== */
router.get('/', stockController.index);

/* =====================================================
   🔍 AUTOCOMPLETE
===================================================== */
router.get('/autocomplete', stockController.autocomplete);

/* =====================================================
   📱 QR → VARIANTE EXACTA
===================================================== */
router.get('/qr/:qr', stockController.verPorQr);

/* =====================================================
   ⌨️ CÓDIGO MANUAL → TODAS LAS VARIANTES
===================================================== */
router.get('/codigo/:codigo', stockController.verPorCodigo);

// QR visual (PNG)
router.get('/qr-image/:qr', stockController.qrImage);

// PDF imprimible
router.get('/qr-pdf/:qr', stockController.qrPdf);
// PDF masivo de QR (etiquetas)
router.post('/qr-pdf-masivo', stockController.qrPdfMasivo);


module.exports = router;
