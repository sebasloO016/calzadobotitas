// controllers/inventarioController.js
const Inventario = require('../models/inventarioModel');
const Compras = require('../models/comprasModel');

/* =====================================================
   🔍 AUTOCOMPLETE DE PRODUCTOS
===================================================== */
exports.autocompleteProductos = (req, res) => {
    const texto = (req.query.texto || '').trim();
    if (!texto) return res.json([]);

    Inventario.autocompleteProductos(texto, (err, rows) => {
        if (err) {
            console.error('❌ Error autocomplete:', err);
            return res.json([]);
        }

        // Agrupar por producto
        const resultado = {};

        rows.forEach(r => {
            if (!resultado[r.ProductoID]) {
                resultado[r.ProductoID] = {
                    ProductoID: r.ProductoID,
                    Codigo: r.Codigo,
                    Nombre: r.Nombre,
                    Foto: r.Foto
                        ? (r.Foto.startsWith('/uploads/')
                            ? r.Foto
                            : `/uploads/productos/${r.Foto}`)
                        : null,
                    variantes: []
                };
            }

            if (r.VarianteID) {
                resultado[r.ProductoID].variantes.push({
                    VarianteID: r.VarianteID,
                    Stock: r.Stock,
                    TallaID: r.TallaID,
                    Talla: r.Talla,
                    ColorID: r.ColorID,
                    Color: r.Color,
                    MaterialID: r.MaterialID,
                    Material: r.Material,
                    UbicacionID: r.UbicacionID,
                    Ubicacion: r.Ubicacion
                });
            }
        });

        res.json(Object.values(resultado));
    });
};
exports.obtenerVariantesPorCodigo = (req, res) => {
    const { codigo } = req.params;

    Inventario.obtenerVariantesPorCodigo(codigo, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener variantes' });
        }
        res.json(rows);
    });
};

/* =====================================================
   📦 VER INVENTARIO GENERAL
===================================================== */
exports.verInventario = (req, res) => {
    const Inventario = require('../models/inventarioModel');

    Inventario.obtenerInventarioGeneral((err, rows) => {
        if (err) {
            console.error('❌ Error inventario:', err);
            return res.status(500).send('Error al cargar inventario');
        }

        const productos = {};

        rows.forEach(r => {
            if (!productos[r.Codigo]) {
                productos[r.Codigo] = {
                    Codigo: r.Codigo,
                    Nombre: r.Nombre,
                    Tipo: r.Tipo,
                    Genero: r.Genero,
                    PrecioVenta: r.PrecioVenta,
                    Estado: r.Estado,
                    Foto: r.Foto
                        ? (r.Foto.startsWith('/uploads/')
                            ? r.Foto
                            : `/uploads/productos/${r.Foto}`)
                        : null,
                    TotalStock: 0,
                    totalVariantes: 0,
                    Variantes: []
                };
            }

            if (r.VarianteID) {
                productos[r.Codigo].Variantes.push({
                    VarianteID: r.VarianteID,
                    Talla: r.Talla,
                    Color: r.Color,
                    Material: r.Material,
                    Ubicacion: r.Ubicacion,
                    Stock: r.Stock
                });
                productos[r.Codigo].TotalStock += r.Stock;
                productos[r.Codigo].totalVariantes++;
            }
        });

        res.render('inventario/verInventario', {
            productos: Object.values(productos)
        });
    });
};

/* =====================================================
   ➕ PROCESAR RE-STOCK (NUEVA COMPRA)
===================================================== */
// controllers/inventarioController.js
exports.procesarRestock = async (req, res) => {
    const { ProveedorID, NumeroFactura, FechaCompra, variantes } = req.body;

    if (!ProveedorID || !Array.isArray(variantes) || variantes.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos para re-stock' });
    }

    try {
        const detalleCompra = [];

        for (const v of variantes) {
            if (
                !v.VarianteID ||
                !v.Cantidad ||
                v.Cantidad <= 0 ||
                !v.CostoUnitario
            ) continue;

            detalleCompra.push({
                VarianteID: v.VarianteID,
                Cantidad: v.Cantidad,
                CostoUnitario: v.CostoUnitario
            });
        }

        if (detalleCompra.length === 0) {
            return res.status(400).json({ error: 'No hay cantidades válidas para re-stock' });
        }

        const Compras = require('../models/comprasModel');

        await new Promise((resolve, reject) => {
            Compras.crearCompraAutomatica({
                ProveedorID,
                FechaCompra: FechaCompra || new Date().toISOString().split('T')[0],
                NumeroFactura: NumeroFactura || '',
                Detalle: detalleCompra
            }, err => err ? reject(err) : resolve());
        });

        res.json({
            success: true,
            message: 'Re-stock registrado correctamente'
        });

    } catch (err) {
        console.error('❌ Error re-stock:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    autocompleteProductos: exports.autocompleteProductos,
    obtenerVariantesPorCodigo: exports.obtenerVariantesPorCodigo,
    verInventario: exports.verInventario,
    procesarRestock: exports.procesarRestock
};
