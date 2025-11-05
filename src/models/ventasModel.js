// models/ventasModel.js
const db = require('../db/db');

const ventasModel = {
  // 🔹 Buscar cliente por identificación
  findClienteByIdentificacion: (identificacion, callback) => {
    db.query('SELECT * FROM clientes WHERE Identificacion = ?', [identificacion], callback);
  },

  // 🔹 Crear nuevo cliente
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

  // 🔹 Crear nueva venta
  createVenta: (clienteId, formaDePago, callback) => {
    const query = 'INSERT INTO ventas (ClienteID, EmpresaID, FormaDePago) VALUES (?, 1, ?)';
    db.query(query, [clienteId, formaDePago], callback);
  },

  // 🔹 Buscar producto por código
  findProductoByCodigo: (codigo, callback) => {
    db.query('SELECT * FROM productos WHERE Codigo = ?', [codigo], callback);
  },

  // 🔹 Insertar detalle de venta
  createDetalleVenta: (detalle, callback) => {
    const query = `
      INSERT INTO detalleventas (VentaID, ProductoID, Cantidad, Precio, Descuento, IvaID, IvaValor)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      detalle.VentaID,
      detalle.ProductoID,
      detalle.Cantidad,
      detalle.Precio,
      detalle.Descuento,
      detalle.IvaID,
      detalle.IvaValor
    ];
    db.query(query, values, callback);
  },

  // 🔹 Actualizar stock del producto
  updateStock: (productoId, nuevaCantidad, callback) => {
    db.query('UPDATE productos SET Cantidad = ? WHERE ProductoID = ?', [nuevaCantidad, productoId], callback);
  },

  // 🔹 Obtener historial con cédula y totales
  getHistorialVentas: (callback) => {
    const query = `
      SELECT 
        v.VentaID,
        v.Fecha,
        v.FormaDePago,
        c.Nombre AS Cliente,
        c.Identificacion,
        COALESCE(SUM(dv.ValorTotal), 0) AS ValorTotal
      FROM ventas v
      LEFT JOIN clientes c ON v.ClienteID = c.ClienteID
      LEFT JOIN detalleventas dv ON v.VentaID = dv.VentaID
      GROUP BY v.VentaID, v.Fecha, v.FormaDePago, c.Nombre, c.Identificacion
      ORDER BY v.Fecha DESC;
    `;
    db.query(query, callback);
  },

  // 🔹 Obtener detalle de una venta
  getDetalleVenta: (ventaId, callback) => {
    const queryVenta = `
      SELECT 
        v.VentaID, v.Fecha, v.FormaDePago,
        c.Nombre AS Cliente, c.Identificacion
      FROM ventas v
      LEFT JOIN clientes c ON v.ClienteID = c.ClienteID
      WHERE v.VentaID = ?;
    `;

    const queryDetalles = `
      SELECT 
        p.Nombre AS Producto,
        dv.Cantidad,
        dv.Precio,
        dv.Descuento,
        dv.SubtotalSinImpuestos AS Subtotal,
        dv.ValorTotal
      FROM detalleventas dv
      JOIN productos p ON dv.ProductoID = p.ProductoID
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

  // 🔹 Anular venta (elimina venta y devuelve stock)
  anularVenta: (ventaId, callback) => {
    db.beginTransaction(err => {
      if (err) return callback(err);

      const qDetalles = 'SELECT ProductoID, Cantidad FROM detalleventas WHERE VentaID = ?';
      db.query(qDetalles, [ventaId], (err, detalles) => {
        if (err) return db.rollback(() => callback(err));

        const promises = detalles.map(d => {
          return new Promise((resolve, reject) => {
            db.query(
              'UPDATE productos SET Cantidad = Cantidad + ? WHERE ProductoID = ?',
              [d.Cantidad, d.ProductoID],
              (err) => err ? reject(err) : resolve()
            );
          });
        });

        Promise.all(promises)
          .then(() => {
            db.query('DELETE FROM detalleventas WHERE VentaID = ?', [ventaId], (err) => {
              if (err) return db.rollback(() => callback(err));

              db.query('DELETE FROM ventas WHERE VentaID = ?', [ventaId], (err) => {
                if (err) return db.rollback(() => callback(err));
                db.commit(callback);
              });
            });
          })
          .catch(err => db.rollback(() => callback(err)));
      });
    });
  }
};

module.exports = ventasModel;
