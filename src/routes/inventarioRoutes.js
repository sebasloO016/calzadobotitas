// routes/inventarioRoutes.js
const express = require('express');
const router = express.Router();

const inventarioController = require('../controllers/inventarioController');

/* =====================================================
   📄 VISTA RE-STOCK
===================================================== */
// GET /inventario/agregar
router.get('/agregar', (req, res) => {
    // Estos datos se envían al EJS
    // Ajusta los models si los traes desde otro lado
    const crearProductoModel = require('../models/crearProductoModel');
    const proveedorModel = require('../models/proveedorModel');

    Promise.all([
        new Promise((r, j) => crearProductoModel.getAllTallas((e, d) => e ? j(e) : r(d))),
        new Promise((r, j) => crearProductoModel.getAllColores((e, d) => e ? j(e) : r(d))),
        new Promise((r, j) => crearProductoModel.getAllMateriales((e, d) => e ? j(e) : r(d))),
        new Promise((r, j) => proveedorModel.getAll((e, d) => e ? j(e) : r(d)))
    ])
        .then(([tallas, colores, materiales, proveedores]) => {
            res.render('inventario/agregarProducto', {
                tallas,
                colores,
                materiales,
                proveedores
            });
        })
        .catch(err => {
            console.error('❌ Error cargando formulario re-stock:', err);
            res.status(500).send('Error al cargar formulario de re-stock');
        });
});
router.get('/variantes/:codigo', inventarioController.obtenerVariantesPorCodigo);

/* =====================================================
   🔍 AUTOCOMPLETE PRODUCTOS
===================================================== */
// GET /inventario/autocomplete?texto=911
router.get('/autocomplete', inventarioController.autocompleteProductos);

/* =====================================================
   ➕ PROCESAR RE-STOCK (NUEVA COMPRA)
===================================================== */
// POST /inventario/restock
router.post('/restock', inventarioController.procesarRestock);
router.get('/', inventarioController.verInventario);

module.exports = router;
