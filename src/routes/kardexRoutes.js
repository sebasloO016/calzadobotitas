const express = require('express');
const router = express.Router();
const kardexController = require('../controllers/kardexController');

router.get('/', kardexController.verKardexPage);                 // página con buscador
router.get('/variante/:id', kardexController.verKardexVariante); // kardex directo por variante

module.exports = router;
