// controllers/crearProductoController.js (código completo actualizado)
const crearProductoModel = require('../models/crearProductoModel');
const proveedorModel = require('../models/proveedorModel');
const comprasModel = require('../models/comprasModel');


// ======================================================
// 🧱 RENDER FORMULARIO (trae todos los selects separados)
// ======================================================
exports.renderCrearProducto = (req, res) => {
    crearProductoModel.getAllTipos((err, tipos) => {
        if (err) return res.status(500).send('Error al obtener tipos');
        crearProductoModel.getAllMateriales((err, materiales) => {
            if (err) return res.status(500).send('Error al obtener materiales');
            crearProductoModel.getAllGeneros((err, generos) => {
                if (err) return res.status(500).send('Error al obtener géneros');
                crearProductoModel.getAllColores((err, colores) => {
                    if (err) return res.status(500).send('Error al obtener colores');
                    crearProductoModel.getAllTallas((err, tallas) => {
                        if (err) return res.status(500).send('Error al obtener tallas');
                        crearProductoModel.getAllUbicaciones((err, ubicaciones) => {
                            if (err) return res.status(500).send('Error al obtener ubicaciones');
                            proveedorModel.getAll((err, proveedores) => {
                                if (err) return res.status(500).send('Error al obtener proveedores');
                                res.render('crearProducto/crearProducto', {
                                    tipos,
                                    materiales,
                                    generos,
                                    colores,
                                    tallas,
                                    ubicaciones,
                                    proveedores,
                                    error: null
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

// ======================================================
// 👟 CREAR PRODUCTO CON VARIAS TALLAS (validación de duplicados)
// ======================================================
exports.crearProducto = (req, res) => {
    // 📸 Manejo de la imagen o URL
    let fotoFinal = null;
    if (req.file) {
        // Si el usuario subió una imagen
        fotoFinal = `/uploads/productos/${req.file.filename}`;
    } else if (req.body.Foto) {
        // Si el usuario puso una URL
        fotoFinal = req.body.Foto;
    }
    const body = req.body;
    const tallas = Array.isArray(body.TallaID) ? body.TallaID.filter(x => x) : (body.TallaID ? [body.TallaID] : []);
    const cantidades = Array.isArray(body.Cantidad) ? body.Cantidad.filter(x => x) : (body.Cantidad ? [body.Cantidad] : []);
    const ubicaciones = Array.isArray(body.UbicacionID) ? body.UbicacionID.filter(x => x) : (body.UbicacionID ? [body.UbicacionID] : []);
    const totalCompra = cantidades.reduce((a, b) => a + parseInt(b || 0), 0) * parseFloat(body.PrecioCosto);

    // Verificar si el código ya existe
    crearProductoModel.getProductoByCodigo(body.Codigo, (err, existente) => {
        if (err) return res.status(500).send('Error al verificar código');
        if (existente) {
            // Si existe, mostrar error
            return crearProductoModel.getAllTipos((err, tipos) => {
                if (err) return res.status(500).send('Error al obtener tipos');
                crearProductoModel.getAllMateriales((err, materiales) => {
                    if (err) return res.status(500).send('Error al obtener materiales');
                    crearProductoModel.getAllGeneros((err, generos) => {
                        if (err) return res.status(500).send('Error al obtener géneros');
                        crearProductoModel.getAllColores((err, colores) => {
                            if (err) return res.status(500).send('Error al obtener colores');
                            crearProductoModel.getAllTallas((err, tallasList) => {
                                if (err) return res.status(500).send('Error al obtener tallas');
                                crearProductoModel.getAllUbicaciones((err, ubicaciones) => {
                                    if (err) return res.status(500).send('Error al obtener ubicaciones');
                                    proveedorModel.getAll((err, proveedores) => {
                                        if (err) return res.status(500).send('Error al obtener proveedores');
                                        const errorMsg = `El producto con código ${body.Codigo} ya existe. Si desea modificar stock o precio, use la opción "Re-Stock Producto".`;
                                        return res.render('crearProducto/crearProducto', {
                                            tipos,
                                            materiales,
                                            generos,
                                            colores,
                                            tallas: tallasList,
                                            ubicaciones,
                                            proveedores,
                                            error: errorMsg
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }

        // Paso 1: Buscar o crear la categoría combinada (solo Tipo y Genero)
        crearProductoModel.findOrCreateCategoria(
            body.TipoID,
            body.GeneroID,
            (err, categoriaId) => {
                if (err) return res.status(500).send('Error al obtener/crear categoría');

                // Crear el producto base
                const producto = {
                    Codigo: body.Codigo,
                    Nombre: body.Nombre,
                    CategoriaID: categoriaId,
                    Detalle: body.Detalle,
                    Foto: fotoFinal,
                    PrecioCosto: body.PrecioCosto,
                    PrecioVenta: body.PrecioVenta
                };

                crearProductoModel.crearProducto(producto, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error al crear producto');
                    }

                    const productoId = result.insertId;

                    // 🔒 array para construir el detalle de compra
                    const variantesCreadas = [];

                    const crearPorTalla = (i) => {
                        if (i >= tallas.length) {
                            // ✅ CUANDO YA SE CREARON TODAS LAS VARIANTES
                            return comprasModel.crearCompraAutomatica({
                                ProveedorID: body.ProveedorID,
                                FechaCompra: body.FechaCompra || new Date().toISOString().split('T')[0],
                                NumeroFactura: body.NumeroFactura || '',
                                Detalle: variantesCreadas
                            }, (err) => {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).send('Error al registrar compra automática');
                                }

                                return res.redirect('/crearProducto/verTodos');
                            });
                        }

                        // 🧱 crear variante SIN stock inicial
                        const variante = {
                            ProductoID: productoId,
                            TallaID: tallas[i],
                            ColorID: body.ColorID,
                            MaterialID: body.MaterialID,
                            UbicacionID: ubicaciones[i],
                            Stock: 0, // 🔒 el stock entra SOLO por compras
                            CostoUnitario: body.PrecioCosto,
                            PrecioVentaVariante: body.PrecioVenta
                        };

                        crearProductoModel.crearVariante(variante, (err, vResult) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).send('Error al crear variante');
                            }

                            // 🔥 guardar info para el DETALLE de la compra
                            variantesCreadas.push({
                                VarianteID: vResult.insertId,
                                TallaID: tallas[i],
                                Cantidad: cantidades[i],
                                CostoUnitario: body.PrecioCosto
                            });

                            crearPorTalla(i + 1);
                        });
                    };

                    // 🚀 iniciar creación por tallas
                    crearPorTalla(0);
                });

            }
        );
    });
};

// ======================================================
// 📋 VER TODOS LOS PRODUCTOS
// ======================================================
// controllers/crearProductoController.js
exports.verTodosProductos = (req, res) => {
    crearProductoModel.getAllProductos((err, productos) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.render('crearProducto/verProducto', {
                productos: [],
                error: 'Error al cargar los productos. Intenta de nuevo más tarde.'
            });
        }

        crearProductoModel.getAllDetalles((err, detalles) => {
            if (err) {
                console.error('Error al obtener detalles:', err);
                return res.render('crearProducto/verProducto', {
                    productos: productos || [],
                    error: 'Error al cargar detalles adicionales.'
                });
            }

            res.render('crearProducto/verProducto', {
                productos: productos || [],
                detalles: detalles || [],
                error: null   // ← Esto soluciona el error principal
            });
        });
    });
};

// ======================================================
// ✏️ RENDER FORMULARIO DE EDICIÓN
// ======================================================
exports.renderEditarProducto = (req, res) => {
    const codigo = req.params.codigo;

    crearProductoModel.getProductoByCodigo(codigo, (err, producto) => {
        if (err || !producto) {
            return res.status(404).send('Producto no encontrado');
        }

        crearProductoModel.getVariantesByProductoId(producto.ProductoID, (err, variantes) => {
            if (err) return res.status(500).send('Error al obtener variantes');

            // Traer todas las tablas necesarias para los selects
            crearProductoModel.getAllTipos((err, tipos) => {
                if (err) return res.status(500).send('Error al obtener tipos');
                crearProductoModel.getAllMateriales((err, materiales) => {
                    if (err) return res.status(500).send('Error al obtener materiales');
                    crearProductoModel.getAllGeneros((err, generos) => {
                        if (err) return res.status(500).send('Error al obtener géneros');
                        crearProductoModel.getAllColores((err, colores) => {
                            if (err) return res.status(500).send('Error al obtener colores');
                            crearProductoModel.getAllTallas((err, tallas) => {
                                if (err) return res.status(500).send('Error al obtener tallas');
                                crearProductoModel.getAllUbicaciones((err, ubicaciones) => {
                                    if (err) return res.status(500).send('Error al obtener ubicaciones');
                                    res.render('crearProducto/editarProducto', {
                                        producto,
                                        variantes,
                                        tipos,
                                        materiales,
                                        generos,
                                        colores,
                                        tallas,
                                        ubicaciones,
                                        error: null
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

// ======================================================
// 💾 GUARDAR EDICIÓN DE PRODUCTO (con categoría normalizada)
// ======================================================
exports.editarProducto = (req, res) => {
    const codigo = req.params.codigo;
    const body = req.body;

    // 📸 Manejar imagen
    let fotoFinal = body.Foto || null;
    if (req.file) {
        fotoFinal = `/uploads/productos/${req.file.filename}`;
    }

    // Obtener el producto actual para ID
    crearProductoModel.getProductoByCodigo(codigo, (err, producto) => {
        if (err || !producto) return res.status(404).send('Producto no encontrado');
        const productoId = producto.ProductoID;

        // Paso 1️⃣: buscar o crear la categoría combinada (solo Tipo y Genero)
        crearProductoModel.findOrCreateCategoria(
            body.TipoID,
            body.GeneroID,
            (err, categoriaId) => {
                if (err) {
                    console.error('❌ Error al buscar o crear categoría:', err);
                    return res.status(500).send('Error al obtener o crear la categoría');
                }

                // Paso 2️⃣: construir el producto actualizado
                const productoActualizado = {
                    Nombre: body.Nombre,
                    CategoriaID: categoriaId,
                    Detalle: body.Detalle,
                    PrecioCosto: body.PrecioCosto,
                    PrecioVenta: body.PrecioVenta,
                    Foto: fotoFinal
                };

                // Paso 3️⃣: ejecutar la actualización del producto base
                crearProductoModel.actualizarProducto(codigo, productoActualizado, (err) => {
                    if (err) {
                        console.error("❌ Error al actualizar producto:", err);
                        return res.status(500).send('Error al actualizar producto');
                    }

                    // Obtener variantes actuales
                    crearProductoModel.getVariantesByProductoId(productoId, (err, variantesActuales) => {
                        if (err) return res.status(500).send('Error al obtener variantes actuales');

                        const tallasNuevas = Array.isArray(body.TallaID) ? body.TallaID : (body.TallaID ? [body.TallaID] : []);
                        const cantidadesNuevas = Array.isArray(body.Cantidad) ? body.Cantidad : (body.Cantidad ? [body.Cantidad] : []);
                        const ubicacionesNuevas = Array.isArray(body.UbicacionID) ? body.UbicacionID : (body.UbicacionID ? [body.UbicacionID] : []);

                        // Mapa de nuevas tallas para fácil búsqueda
                        const nuevasMap = new Map();
                        tallasNuevas.forEach((tallaId, index) => {
                            nuevasMap.set(parseInt(tallaId), {
                                Cantidad: cantidadesNuevas[index],
                                UbicacionID: ubicacionesNuevas[index]
                            });
                        });

                        // Actualizar o crear variantes
                        // 🔒 EDITAR PRODUCTO: SOLO ACTUALIZA VARIANTES EXISTENTES
                        const procesarVariantes = (i) => {

                            // cuando ya se procesaron todas las variantes existentes
                            if (i >= variantesActuales.length) {
                                return res.redirect('/crearProducto/verTodos');
                            }

                            const varianteExistente = variantesActuales[i];

                            // buscar el índice de esa talla en lo que viene del formulario
                            const index = tallasNuevas.findIndex(
                                t => parseInt(t) === varianteExistente.TallaID
                            );

                            // seguridad: si no se encuentra, se salta
                            if (index === -1) {
                                return procesarVariantes(i + 1);
                            }

                            const varianteData = {
                                VarianteID: varianteExistente.VarianteID,
                                MaterialID: body.MaterialID,
                                UbicacionID: ubicacionesNuevas[index],
                                Stock: cantidadesNuevas[index],
                                CostoUnitario: body.PrecioCosto,
                                PrecioVentaVariante: body.PrecioVenta
                            };

                            crearProductoModel.actualizarVariante(varianteData, (err) => {
                                if (err) {
                                    console.error(err);
                                    return res.render('crearProducto/editarProducto', {
                                        error: 'Error al actualizar variante'
                                    });
                                }

                                // continuar con la siguiente variante
                                procesarVariantes(i + 1);
                            });
                        };


                        procesarVariantes(0);
                    });
                });
            }
        );
    });
};

// ======================================================
// 🔁 CAMBIAR ESTADO ACTIVO / INACTIVO
// ======================================================
exports.cambiarEstadoProducto = (req, res) => {
    const codigo = req.params.codigo;
    const nuevoEstado = req.body.Estado;

    if (!nuevoEstado) {
        return res.status(400).json({ error: 'Estado no especificado' });
    }

    crearProductoModel.cambiarEstado(codigo, nuevoEstado, (err) => {
        if (err) {
            console.error('❌ Error al cambiar estado del producto:', err);
            return res.status(500).json({ error: 'Error al cambiar el estado' });
        }

        console.log(`🔄 Estado de ${codigo} actualizado a ${nuevoEstado}`);
        res.status(200).json({ success: true });
    });
};