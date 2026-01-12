// models/ventasModel.js
const db = require('../db/db');

const ventasModel = {

  // ==============================================================
  // 🟢 SECCIÓN: DATOS MAESTROS (IVA, CONFIG)
  // ==============================================================

  // Obtener tarifas de IVA activas para el select del frontend
  getIvaRates: (callback) => {
    const query = "SELECT IvaID, Porcentaje, Descripcion FROM iva WHERE Estado = 'activo'";
    db.query(query, callback);
  },

  // ==============================================================
  // 🟢 SECCIÓN: CLIENTES (Búsqueda, Creación y Edición)
  // ==============================================================

  // Buscar cliente por Identificación (Cédula/RUC)
  findClienteByIdentificacion: (identificacion, callback) => {
    const query = 'SELECT * FROM clientes WHERE Identificacion = ?';
    db.query(query, [identificacion], callback);
  },

  // Crear nuevo cliente
  createCliente: (cliente, callback) => {
    const query = `
      INSERT INTO clientes (Nombre, Celular, Email, TipoIdentificacion, Identificacion, Direccion)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      cliente.nombre,
      cliente.celular,
      cliente.email,
      cliente.tipoIdentificacion,
      cliente.identificacion,
      cliente.direccion
    ];
    db.query(query, values, callback);
  },

  // 🔹 Actualizar cliente existente (Para edición en caliente)
  updateCliente: (id, cliente, callback) => {
    const query = `
      UPDATE clientes 
      SET Nombre = ?, Celular = ?, Email = ?, Direccion = ?, TipoIdentificacion = ?
      WHERE ClienteID = ?
    `;
    const values = [
      cliente.nombre,
      cliente.celular,
      cliente.email,
      cliente.direccion,
      cliente.tipoIdentificacion,
      id
    ];
    db.query(query, values, callback);
  },

  // ==============================================================
  // 🟢 SECCIÓN: PRODUCTOS (Búsqueda para el Carrito)
  // ==============================================================

  // Buscar producto y sus variantes por código de barras/manual
  findProductoByCodigo: (codigo, callback) => {
    // 📸 AÑADIDO: p.Foto para la previsualización en el buscador
    const sql = `
      SELECT 
        p.ProductoID,
        p.Nombre AS Producto,
        p.Codigo,
        p.Foto,  
        p.PrecioVenta AS PrecioBase,
        v.VarianteID,
        v.Stock,
        v.PrecioVentaVariante,
        t.Valor AS Talla,
        c.Nombre AS Color,
        m.Nombre AS Material
      FROM productos p
      JOIN variantes_producto v ON p.ProductoID = v.ProductoID
      LEFT JOIN tallas t ON v.TallaID = t.TallaID
      LEFT JOIN colores c ON v.ColorID = c.ColorID
      LEFT JOIN materiales m ON v.MaterialID = m.MaterialID
      WHERE p.Codigo = ? AND p.Estado = 'activo'
    `;
    db.query(sql, [codigo], callback);
  },

  // ==============================================================
  // 🟢 SECCIÓN: HISTORIAL Y REPORTES
  // ==============================================================

  // Obtener historial de ventas (Resumen)
  getHistorialVentas: (callback) => {
    // 📸 AÑADIDO: Subconsulta para traer la FotoPrincipal del primer producto vendido
    const query = `
      SELECT 
  v.VentaID,
  v.Fecha,
  v.FormaDePago,
  v.TotalVenta,
  v.Estado,
  v.NumeroFacturaSri,
  c.Nombre AS Cliente,
  c.Identificacion,
  u.Nombre AS Vendedor,
  (SELECT p.Foto 
   FROM detalleventas dv 
   JOIN productos p ON dv.ProductoID = p.ProductoID 
   WHERE dv.VentaID = v.VentaID 
   LIMIT 1) AS FotoPrincipal
FROM ventas v
LEFT JOIN clientes c ON v.ClienteID = c.ClienteID
LEFT JOIN usuarios u ON v.UsuarioID = u.UsuarioID
ORDER BY v.Fecha DESC;

    `;
    db.query(query, callback);
  },

  // Obtener detalle completo de una venta específica (Encabezado + Productos)
  getDetalleVenta: (ventaId, callback) => {
    const queryVenta = `
  SELECT 
    v.VentaID, v.Fecha, v.FormaDePago, v.TotalVenta, v.Estado, 
    v.NumeroFacturaSri, v.Subtotal, v.IvaValor, v.DescuentoTotal,
    c.Nombre AS Cliente, c.Identificacion, c.Direccion, c.Email, c.Celular,
    u.Nombre AS Vendedor
  FROM ventas v
  LEFT JOIN clientes c ON v.ClienteID = c.ClienteID
  LEFT JOIN usuarios u ON v.UsuarioID = u.UsuarioID
  WHERE v.VentaID = ?;
`;


    // 📸 AÑADIDO: p.Foto para mostrar miniaturas en el modal de detalles
    const queryDetalles = `
      SELECT 
        p.Nombre AS Producto,
        p.Codigo,
        p.Foto, 
        t.Valor AS Talla,
        c.Nombre AS Color,
        dv.Cantidad,
        dv.PrecioUnitario,
        dv.Descuento,
        dv.IvaValor,
        dv.ValorTotal
      FROM detalleventas dv
      JOIN variantes_producto vp ON dv.VarianteID = vp.VarianteID
      JOIN productos p ON dv.ProductoID = p.ProductoID
      LEFT JOIN tallas t ON vp.TallaID = t.TallaID
      LEFT JOIN colores c ON vp.ColorID = c.ColorID
      WHERE dv.VentaID = ?;
    `;

    db.query(queryVenta, [ventaId], (err, ventaRes) => {
      if (err) return callback(err);
      if (ventaRes.length === 0) return callback(new Error('Venta no encontrada.'));

      db.query(queryDetalles, [ventaId], (err, detalleRes) => {
        if (err) return callback(err);
        callback(null, { venta: ventaRes[0], detalles: detalleRes });
      });
    });
  },

  // ==============================================================
  // 🟢 SECCIÓN: ANULACIÓN (Lógica Transaccional)
  // ==============================================================

  anularVenta: async (ventaId, callback) => {
    let connection;

    try {
      // 1️⃣ Obtener conexión real
      connection = await db.promise().getConnection();
      await connection.beginTransaction();

      // 2️⃣ Verificar estado de la venta (bloqueo)
      const [ventaRows] = await connection.query(
        'SELECT Estado FROM ventas WHERE VentaID = ? FOR UPDATE',
        [ventaId]
      );

      if (!ventaRows.length) {
        throw new Error('Venta no encontrada');
      }

      if (ventaRows[0].Estado === 'Anulada') {
        throw new Error('La venta ya está anulada');
      }

      // 3️⃣ Obtener detalles
      const [detalles] = await connection.query(
        'SELECT VarianteID, Cantidad FROM detalleventas WHERE VentaID = ?',
        [ventaId]
      );

      // 4️⃣ Devolver stock + kardex
      for (const d of detalles) {
        await connection.query(
          'UPDATE variantes_producto SET Stock = Stock + ? WHERE VarianteID = ?',
          [d.Cantidad, d.VarianteID]
        );

        await connection.query(
          `INSERT INTO movimientos_stock 
         (VarianteID, Tipo, Cantidad, Referencia)
         VALUES (?, 'ENTRADA', ?, ?)`,
          [d.VarianteID, d.Cantidad, `ANULACIÓN VENTA #${ventaId}`]
        );
      }

      // 5️⃣ Cambiar estado
      await connection.query(
        "UPDATE ventas SET Estado = 'Anulada' WHERE VentaID = ?",
        [ventaId]
      );

      // 6️⃣ Confirmar
      await connection.commit();
      callback(null, { success: true });

    } catch (error) {
      if (connection) await connection.rollback();
      callback(error);
    } finally {
      if (connection) connection.release();
    }
  }


};

module.exports = ventasModel;