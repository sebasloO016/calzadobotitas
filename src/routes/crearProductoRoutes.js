//routes/crearProductoRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crearProductoController = require('../controllers/crearProductoController');

// 📦 Configuración de subida de imagen (igual que en crear)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads/productos'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// ======================================================
// RUTAS DE PRODUCTO
// ======================================================
router.get('/crear', crearProductoController.renderCrearProducto);
router.post('/crear', upload.single('FotoFile'), crearProductoController.crearProducto);

router.get('/verTodos', crearProductoController.verTodosProductos);

// ✅ NUEVAS RUTAS DE EDICIÓN
router.get('/editar/:codigo', crearProductoController.renderEditarProducto);
router.post('/editar/:codigo', upload.single('FotoFile'), crearProductoController.editarProducto);
// ✅ Cambiar estado (activar/desactivar producto)
router.patch('/cambiarEstado/:codigo', crearProductoController.cambiarEstadoProducto);

module.exports = router;
