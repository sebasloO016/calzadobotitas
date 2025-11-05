//usuariosRoutes.js
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.get('/', usuariosController.getUsuarios);
router.post('/editar/:id', usuariosController.editarUsuario);
router.post('/crear', usuariosController.crearUsuario);
router.post('/eliminar/:id', usuariosController.eliminarUsuario);

module.exports = router;