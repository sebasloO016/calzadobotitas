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
   /* =====================================================
   ➕ PROCESAR RE-STOCK (CON CREACIÓN AUTOMÁTICA)
===================================================== */
exports.procesarRestock = async (req, res) => {
    const { ProveedorID, NumeroFactura, FechaCompra, Codigo, variantes } = req.body; // Asegúrate de recibir el Codigo del producto

    if (!ProveedorID || !Array.isArray(variantes) || variantes.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos para re-stock' });
    }

    try {
        const Inventario = require('../models/inventarioModel');
        const Compras = require('../models/comprasModel');

        // 1. Obtener el ProductoID base usando el Código
        const productoBase = await new Promise((resolve, reject) => {
            Inventario.getProductoByCodigo(Codigo, (err, p) => err ? reject(err) : resolve(p));
        });

        if (!productoBase) {
            return res.status(404).json({ error: 'Producto base no encontrado' });
        }

        const detalleCompra = [];

        // 2. Iterar sobre las variantes enviadas
        for (const v of variantes) {
            // Validar datos básicos
            if (!v.Cantidad || v.Cantidad <= 0 || !v.CostoUnitario) continue;

            let finalVarianteID = v.VarianteID;

            // SI NO TIENE ID, ES UNA NUEVA VARIANTE QUE HAY QUE CREAR O BUSCAR
            if (!finalVarianteID) {
                if (!v.TallaID || !v.ColorID || !v.MaterialID) {
                    continue; // Si falta info estructural, saltar
                }

                // Datos para búsqueda/creación
                const datosVariante = {
                    ProductoID: productoBase.ProductoID,
                    TallaID: v.TallaID,
                    ColorID: v.ColorID,
                    MaterialID: v.MaterialID,
                    CostoUnitario: v.CostoUnitario,
                    PrecioVentaVariante: null // Opcional
                };

                // A. Verificar si ya existe (para evitar duplicados)
                const existente = await new Promise((resolve, reject) => {
                    Inventario.getVarianteExistente(datosVariante, (err, row) => err ? reject(err) : resolve(row));
                });

                if (existente) {
                    finalVarianteID = existente.VarianteID;
                } else {
                    // B. Si no existe, CREARLA
                    finalVarianteID = await new Promise((resolve, reject) => {
                        Inventario.crearVariante(datosVariante, (err, newId) => err ? reject(err) : resolve(newId));
                    });
                }
            }

            // Agregar al array final de la compra
            detalleCompra.push({
                VarianteID: finalVarianteID,
                Cantidad: v.Cantidad,
                CostoUnitario: v.CostoUnitario
            });
        }

        if (detalleCompra.length === 0) {
            return res.status(400).json({ error: 'No se pudieron procesar las variantes (verifique datos)' });
        }

        // 3. Crear la compra con los IDs resueltos
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
            message: 'Re-stock y actualización de variantes completada'
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
