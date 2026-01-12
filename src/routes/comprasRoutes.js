const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');

router.get('/', comprasController.listarCompras);
router.get('/ver/:id', comprasController.verCompra);
router.post('/pagar/:id', comprasController.pagarCompra);

module.exports = router;
