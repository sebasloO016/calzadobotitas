const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

router.get('/', proveedorController.getProveedoresPage);
router.get('/crear', proveedorController.getCrearProveedorPage);
router.post('/crear', proveedorController.addProveedor);
router.get('/editar/:id', proveedorController.getEditarProveedorPage);
router.post('/editar/:id', proveedorController.editProveedor);
router.post('/delete/:id', proveedorController.deleteProveedor);

// Buscador AJAX (opcional)
router.get('/buscar', proveedorController.buscarProveedores);

module.exports = router;
