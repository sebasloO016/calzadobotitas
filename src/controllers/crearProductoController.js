const crearProductoModel = require('../models/crearProductoModel');
const proveedorModel = require('../models/proveedorModel');

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
    const tallas = Array.isArray(body.TallaID) ? body.TallaID.filter(x => x) : [];
    const cantidades = Array.isArray(body.Cantidad) ? body.Cantidad.filter(x => x) : [];
    const totalCompra = cantidades.reduce((a, b) => a + parseInt(b || 0), 0) * parseFloat(body.PrecioCosto);

    // Paso 1: Buscar o crear la categoría combinada
    crearProductoModel.findOrCreateCategoria(
        body.TipoID,
        body.MaterialID,
        body.GeneroID,
        body.ColorID,
        (err, categoriaId) => {
            if (err) return res.status(500).send('Error al obtener/crear categoría');

            // 🔍 Verificar si existen productos duplicados antes de crear la compra
            const codigosDuplicados = [];
            let revisados = 0;

            const verificarDuplicados = () => {
                if (revisados >= tallas.length) {
                    // Si existen duplicados, mostramos mensaje al usuario
                    if (codigosDuplicados.length > 0) {
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
                                                    const errorMsg = `Los siguientes productos ya existen: ${codigosDuplicados.join(', ')}. 
                                                    Si desea modificar stock o precio, use la opción "Re-Stock Producto".`;
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
                    } else {
                        // Si no hay duplicados, proceder con la creación
                        return crearCompraYProductos(categoriaId);
                    }
                }
            };

            // Verificar duplicados uno por uno
            if (tallas.length === 0) {
                verificarDuplicados(); // No hay tallas
            } else {
                tallas.forEach((talla) => {
                    const codigoActual = `${body.Codigo}-${talla}`;
                    crearProductoModel.getProductoByCodigo(codigoActual, (err, existente) => {
                        revisados++;
                        if (existente) codigosDuplicados.push(codigoActual);
                        verificarDuplicados();
                    });
                });
            }

            // ===========================================
            // FUNCIÓN: Crear compra y productos
            // ===========================================
            function crearCompraYProductos(categoriaId) {
                const compra = {
                    ProveedorID: body.ProveedorID,
                    FechaCompra: body.FechaCompra || new Date().toISOString().split('T')[0],
                    NumeroFactura: body.NumeroFactura || '',
                    TotalCompra: totalCompra,
                    EstadoPago: 'Pendiente'
                };

                crearProductoModel.crearCompraProveedor(compra, (err, result) => {
                    if (err) return res.status(500).send('Error al crear compra proveedor');
                    const compraId = result.insertId;

                    // Si no hay tallas, crear producto único
                    if (tallas.length === 0) {
                        const producto = {
                            Codigo: body.Codigo,
                            Nombre: body.Nombre,
                            CategoriaID: categoriaId,
                            UbicacionID: body.UbicacionID,
                            Detalle: body.Detalle,
                            Foto: fotoFinal,
                            PrecioCosto: body.PrecioCosto,
                            PrecioVenta: body.PrecioVenta,
                            Cantidad: body.Cantidad || 0,
                            DetalleCompraID: null
                        };
                        return crearProductoModel.crearProducto(producto, (err) => {
                            if (err) return res.status(500).send('Error al crear producto');
                            res.redirect('/crearProducto/verTodos');
                        });
                    }

                    // Crear un producto por cada talla
                    const crearPorTalla = (i) => {
                        if (i >= tallas.length) return res.redirect('/crearProducto/verTodos');

                        const detalle = {
                            CompraProveedorID: compraId,
                            TallaID: tallas[i],
                            Cantidad: cantidades[i],
                            CostoUnitario: body.PrecioCosto
                        };

                        crearProductoModel.crearDetalleCompra(detalle, (err, dRes) => {
                            if (err) return res.status(500).send('Error al crear detalle de compra');

                            const producto = {
                                Codigo: `${body.Codigo}-${tallas[i]}`,
                                Nombre: `${body.Nombre} Talla ${tallas[i]}`,
                                CategoriaID: categoriaId,
                                TallaID: tallas[i],
                                UbicacionID: body.UbicacionID,
                                Detalle: body.Detalle,
                                Foto: fotoFinal,
                                PrecioCosto: body.PrecioCosto,
                                PrecioVenta: body.PrecioVenta,
                                Cantidad: cantidades[i],
                                DetalleCompraID: dRes.insertId
                            };

                            crearProductoModel.crearProducto(producto, (err) => {
                                if (err) return res.status(500).send('Error al crear producto');
                                crearPorTalla(i + 1);
                            });
                        });
                    };

                    crearPorTalla(0);
                });
            }
        }
    );
};

// ======================================================
// 📋 VER TODOS LOS PRODUCTOS
// ======================================================
exports.verTodosProductos = (req, res) => {
    crearProductoModel.getAllProductos((err, productos) => {
        if (err) return res.status(500).send('Error al obtener los productos');

        crearProductoModel.getAllDetalles((err, detalles) => {
            if (err) return res.status(500).send('Error al obtener detalles');
            res.render('crearProducto/verProducto', { productos, detalles });
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

    // Paso 1️⃣: buscar o crear la categoría combinada
    crearProductoModel.findOrCreateCategoria(
        body.TipoID,
        body.MaterialID,
        body.GeneroID,
        body.ColorID,
        (err, categoriaId) => {
            if (err) {
                console.error('❌ Error al buscar o crear categoría:', err);
                return res.status(500).send('Error al obtener o crear la categoría');
            }

            // Paso 2️⃣: construir el producto actualizado
            const productoActualizado = {
                Nombre: body.Nombre,
                CategoriaID: categoriaId,
                TallaID: body.TallaID,
                UbicacionID: body.UbicacionID,
                Detalle: body.Detalle,
                PrecioCosto: body.PrecioCosto,
                PrecioVenta: body.PrecioVenta,
                Cantidad: body.Cantidad,
                Foto: fotoFinal
            };

            // Paso 3️⃣: ejecutar la actualización
            crearProductoModel.actualizarProducto(codigo, productoActualizado, (err) => {
                if (err) {
                    console.error("❌ Error al actualizar producto:", err);
                    return res.status(500).send('Error al actualizar producto');
                }
                console.log(`✅ Producto ${codigo} actualizado correctamente`);
                res.redirect('/crearProducto/verTodos');
            });
        }
    );
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

