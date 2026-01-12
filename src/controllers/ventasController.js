// controllers/ventasController.js
const db = require('../db/db');
const ventasModel = require('../models/ventasModel');

// 🟩 1. Renderizar la pantalla de Nueva Venta
exports.getNuevaVenta = (req, res) => {
  // Obtenemos los IVAs activos para llenar el select del frontend
  ventasModel.getIvaRates((err, ivas) => {
    if (err) {
      console.error('Error cargando IVAs:', err);
      return res.status(500).send('Error al cargar configuración del sistema');
    }

    res.render('ventas/nuevaVenta', {
      ivas: ivas,
      // Pasamos el usuario (si existe sesión) o uno por defecto para mostrar quién vende
      user: req.session.usuario || { Nombre: 'Vendedor' }
    });
  });
};

// 🟩 2. API: Buscar Cliente (Autocompletado)
exports.buscarCliente = (req, res) => {
  const { identificacion } = req.params;
  ventasModel.findClienteByIdentificacion(identificacion, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error de base de datos' });

    // Si no existe, devolvemos 404 (el frontend sabrá que debe permitir crear uno nuevo)
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Cliente nuevo' });

    res.json(rows[0]);
  });
};

// 🟩 3. API: Buscar Producto (Para el buscador con imágenes)
exports.buscarProducto = (req, res) => {
  const { codigo } = req.params;
  ventasModel.findProductoByCodigo(codigo, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al buscar producto' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Devolvemos el array de variantes (Tallas/Colores/Fotos)
    res.json(results);
  });
};

// 🟩 4. PROCESAR VENTA (Transacción Maestra)
exports.postNuevaVenta = async (req, res) => {
  const { cliente, formaPago, productos } = req.body;
  /* Estructura esperada de 'productos': 
     [{ varianteId, cantidad, precioFinal, ivaId, descuento }] 
  */

  // 1. Validaciones básicas de entrada
  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'No hay productos en la venta' });
  }

  // Obtener usuario de la sesión (o ID 1 por defecto si no hay login implementado aún)
  const usuarioId = req.session.usuario ? req.session.usuario.UsuarioID : 1;

  // INICIO DE LA TRANSACCIÓN (Usamos mysql2 promise wrapper)
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    // =================================================================
    // PASO A: GESTIÓN INTELIGENTE DEL CLIENTE (CREAR O ACTUALIZAR)
    // =================================================================
    let clienteId = null;

    // A.1 Buscamos si ya existe por identificación
    const [existingClient] = await connection.query(
      'SELECT ClienteID FROM clientes WHERE Identificacion = ?',
      [cliente.identificacion]
    );

    if (existingClient.length > 0) {
      // ➜ EXISTE: Actualizamos datos (UPSERT) por si cambió correo o dirección
      clienteId = existingClient[0].ClienteID;
      await connection.query(
        `UPDATE clientes 
         SET Nombre=?, Celular=?, Email=?, Direccion=?, TipoIdentificacion=? 
         WHERE ClienteID=?`,
        [cliente.nombre, cliente.celular, cliente.email, cliente.direccion, cliente.tipoIdentificacion, clienteId]
      );
    } else {
      // ➜ NO EXISTE: Creamos nuevo cliente
      const [newClient] = await connection.query(
        `INSERT INTO clientes (Nombre, Celular, Email, TipoIdentificacion, Identificacion, Direccion) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [cliente.nombre, cliente.celular, cliente.email, cliente.tipoIdentificacion, cliente.identificacion, cliente.direccion]
      );
      clienteId = newClient.insertId;
    }

    // =================================================================
    // PASO B: CREAR LA CABECERA DE LA VENTA (Inicial)
    // =================================================================
    const [ventaResult] = await connection.query(
      `INSERT INTO ventas (ClienteID, EmpresaID, UsuarioID, FormaDePago, TotalVenta, Estado) 
       VALUES (?, 1, ?, ?, 0, 'Completada')`, // TotalVenta se actualiza al final
      [clienteId, usuarioId, formaPago]
    );
    const ventaId = ventaResult.insertId;

    // Variables para acumular totales
    let granTotal = 0;
    let totalIva = 0;
    let totalSubtotal = 0;
    let totalDescuento = 0;

    // =================================================================
    // PASO C: PROCESAR CADA PRODUCTO (Stock y Detalles)
    // =================================================================
    for (const item of productos) {
      const cantidad = parseInt(item.cantidad);
      const precioFinalUsuario = parseFloat(item.precioFinal); // Precio con IVA incluido
      const descuentoLinea = parseFloat(item.descuento || 0);

      // C.1 Verificar Stock Real y Bloquear Fila (FOR UPDATE)
      // Nota: Usamos raw SQL aquí porque estamos DENTRO de la transacción
      const [varianteRows] = await connection.query(
        `SELECT v.Stock, v.ProductoID, p.Nombre, t.Valor as Talla
         FROM variantes_producto v 
         JOIN productos p ON v.ProductoID = p.ProductoID 
         LEFT JOIN tallas t ON v.TallaID = t.TallaID
         WHERE v.VarianteID = ? FOR UPDATE`, // 🔒 Bloqueo Crítico
        [item.varianteId]
      );

      if (varianteRows.length === 0) {
        throw new Error(`Variante ID ${item.varianteId} no encontrada (posiblemente eliminada).`);
      }

      const prodData = varianteRows[0];

      if (prodData.Stock < cantidad) {
        throw new Error(`Stock insuficiente para ${prodData.Nombre} (Talla: ${prodData.Talla}). Disponible: ${prodData.Stock}`);
      }

      // C.2 Obtener porcentaje de IVA
      const [ivaRows] = await connection.query('SELECT Porcentaje FROM iva WHERE IvaID = ?', [item.ivaId]);
      const porcentajeIva = ivaRows.length ? parseFloat(ivaRows[0].Porcentaje) : 0;

      // C.3 CÁLCULO INVERSO (Precio Final --> Base + IVA)
      // Primero restamos descuento al precio final que dio el usuario
      const precioRealConImpuesto = precioFinalUsuario - (descuentoLinea / cantidad);

      // Desglosamos: Precio = Base * (1 + %IVA)
      const baseImponibleUnit = precioRealConImpuesto / (1 + (porcentajeIva / 100));
      const ivaUnitario = precioRealConImpuesto - baseImponibleUnit;

      // Totales de la línea
      const subtotalLinea = baseImponibleUnit * cantidad;
      const ivaTotalLinea = ivaUnitario * cantidad;
      const totalLinea = precioRealConImpuesto * cantidad; // Debe coincidir con lo cobrado

      // Acumulamos
      granTotal += totalLinea;
      totalIva += ivaTotalLinea;
      totalSubtotal += subtotalLinea;
      totalDescuento += descuentoLinea;

      // C.4 Insertar Detalle de Venta
      await connection.query(
        `INSERT INTO detalleventas 
        (VentaID, ProductoID, VarianteID, Cantidad, PrecioUnitario, Descuento, IvaID, IvaValor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ventaId,
          prodData.ProductoID,
          item.varianteId,
          cantidad,
          baseImponibleUnit, // Guardamos la base limpia para contabilidad
          descuentoLinea,
          item.ivaId,
          ivaTotalLinea
        ]
      );

      // C.5 Descontar Stock
      await connection.query(
        'UPDATE variantes_producto SET Stock = Stock - ? WHERE VarianteID = ?',
        [cantidad, item.varianteId]
      );

      // C.6 Registrar Movimiento de Kardex (Salida)
      await connection.query(
        `INSERT INTO movimientos_stock (VarianteID, Tipo, Cantidad, Referencia) 
         VALUES (?, 'SALIDA', ?, ?)`,
        [item.varianteId, cantidad, `VENTA #${ventaId}`]
      );
    }

    // =================================================================
    // 🟢 PASO D (NUEVO): GENERAR SECUENCIAL Y CLAVE DE ACCESO SRI
    // =================================================================

    // 1. Obtener datos de la empresa (RUC) para la clave
    const [empresaData] = await connection.query("SELECT RUC FROM empresa WHERE EmpresaID = 1");
    const rucEmpresa = empresaData.length ? empresaData[0].RUC : '9999999990001';

    // 2. Calcular el siguiente número de factura (Ej: 000000005)
    // Buscamos el último número usado en la BD
    const [lastInvoice] = await connection.query(
      "SELECT NumeroFacturaSri FROM ventas WHERE NumeroFacturaSri IS NOT NULL ORDER BY VentaID DESC LIMIT 1"
    );

    let siguienteSecuencial = 1;
    if (lastInvoice.length > 0 && lastInvoice[0].NumeroFacturaSri) {
      // Extraemos la parte final (001-001-XXXXXXXXX)
      const partes = lastInvoice[0].NumeroFacturaSri.split('-');
      siguienteSecuencial = parseInt(partes[2]) + 1;
    }

    const establecimiento = '001'; // Punto de emisión
    const puntoEmision = '001';    // Caja
    const secuencialStr = String(siguienteSecuencial).padStart(9, '0');
    // Ej: "000000123"
    const numeroFacturaVisual = `${establecimiento}-${puntoEmision}-${secuencialStr}`;

    // 3. CONSTRUCCIÓN DE LA CLAVE DE ACCESO (49 Dígitos)
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaEmision = `${dia}${mes}${anio}`; // ddmmaaaa

    const tipoComprobante = '01'; // 01 = Factura
    const ambiente = '1';         // 1 = Pruebas, 2 = Producción
    // RUC ya lo tenemos
    const codigoNumerico = '12345678'; // 8 dígitos aleatorios (usamos fijo o random)
    const tipoEmision = '1';      // 1 = Emisión Normal

    // Armamos los primeros 48 dígitos
    const clave48 = `${fechaEmision}${tipoComprobante}${rucEmpresa}${ambiente}${establecimiento}${puntoEmision}${secuencialStr}${codigoNumerico}${tipoEmision}`;

    // Calculamos el dígito 49 (Algoritmo Módulo 11)
    const digitoVerificador = calcularDigitoVerificador(clave48);
    const claveAccesoFinal = `${clave48}${digitoVerificador}`;

    // =================================================================
    // PASO E: ACTUALIZAR VENTA CON TOTALES Y DATOS SRI
    // =================================================================
    await connection.query(
      `UPDATE ventas 
       SET Subtotal=?, IvaValor=?, TotalVenta=?, DescuentoTotal=?, 
           NumeroFacturaSri=?, ClaveAcceso=?, EstadoSri='AUTORIZADO'
       WHERE VentaID=?`,
      [totalSubtotal, totalIva, granTotal, totalDescuento, numeroFacturaVisual, claveAccesoFinal, ventaId]
    );

    await connection.commit();

    // Devolvemos la clave al frontend por si quieres imprimirla
    res.json({
      success: true,
      ventaId: ventaId,
      message: 'Venta registrada y facturada',
      factura: numeroFacturaVisual,
      claveAcceso: claveAccesoFinal
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// 🟩 5. Historial de ventas (Vista)
exports.getHistorialVentas = (req, res) => {
  ventasModel.getHistorialVentas((err, results) => {
    if (err) {
      console.error('❌ Error historial:', err);
      return res.status(500).send('Error al cargar historial.');
    }
    // Renderizamos la vista pasando las ventas
    res.render('ventas/historialVentas', { ventas: results });
  });
};

// 🟩 6. Detalle de venta (API para Modal)
exports.getDetalleVenta = (req, res) => {
  ventasModel.getDetalleVenta(req.params.id, (err, data) => {
    if (err) {
      console.error('❌ Error detalle:', err);
      return res.status(500).json({ error: 'Error al obtener detalle.' });
    }
    res.json(data);
  });
};

// 🟩 7. Anular Venta (POST)
exports.anularVenta = (req, res) => {
  ventasModel.anularVenta(req.params.id, (err) => {
    if (err) {
      console.error('❌ Error anulación:', err);
      return res.status(500).json({ error: err.message || 'Error al anular venta.' });
    }
    res.json({ success: true, message: 'Venta anulada y stock devuelto.' });
  });
};
// =====================================================
// 🔐 SRI – Cálculo del Dígito Verificador (Módulo 11)
// =====================================================
function calcularDigitoVerificador(clave) {
  let suma = 0;
  let multiplicador = 2;

  // Recorremos de derecha a izquierda
  for (let i = clave.length - 1; i >= 0; i--) {
    suma += parseInt(clave[i], 10) * multiplicador;
    multiplicador++;
    if (multiplicador > 7) multiplicador = 2;
  }

  const residuo = suma % 11;
  let digito = 11 - residuo;

  if (digito === 11) digito = 0;
  if (digito === 10) digito = 1;

  return digito;
}



// 🖨️ IMPRIMIR VENTA (EMULADO)
exports.imprimirVenta = (req, res) => {
  const ventaId = req.params.id;

  ventasModel.getDetalleVenta(ventaId, (err, data) => {
    if (err) {
      console.error('❌ Error impresión:', err);
      return res.status(500).send('Error al generar impresión');
    }

    data.venta.TotalVenta = Number(data.venta.TotalVenta);

    res.render('ventas/printTicket', {
      venta: data.venta,
      detalles: data.detalles
    });

  });
};
