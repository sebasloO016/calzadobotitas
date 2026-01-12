const db = require('../db/db');

const Compras = {};

// ===============================
// Listar compras (para verCompras)
// ===============================
Compras.getAll = (callback) => {
  const sql = `
    SELECT 
      c.CompraProveedorID,
      c.ProveedorID,
      p.Nombre AS Proveedor,
      c.FechaCompra,
      c.NumeroFactura,
      c.TotalCompra,
      c.EstadoPago
    FROM compras_proveedor c
    JOIN proveedores p ON c.ProveedorID = p.ProveedorID
    ORDER BY c.CompraProveedorID DESC
  `;
  db.query(sql, callback);
};

// ===============================
// Obtener cabecera compra
// ===============================
Compras.getById = (id, callback) => {
  const sql = `
    SELECT 
      c.CompraProveedorID,
      c.ProveedorID,
      p.Nombre AS Proveedor,
      c.FechaCompra,
      c.NumeroFactura,
      c.TotalCompra,
      c.EstadoPago,
      c.Observaciones
    FROM compras_proveedor c
    JOIN proveedores p ON c.ProveedorID = p.ProveedorID
    WHERE c.CompraProveedorID = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows?.[0] || null);
  });
};

// ===============================
// Obtener detalle compra
// (incluye subtotal calculado)
// ===============================
Compras.getDetalle = (id, callback) => {
  const sql = `
    SELECT 
      d.DetalleCompraID,
      d.TallaID,
      t.Valor AS Talla,
      d.Cantidad,
      d.CostoUnitario,
      (d.Cantidad * d.CostoUnitario) AS Subtotal
    FROM detalle_compras d
    JOIN tallas t ON d.TallaID = t.TallaID
    WHERE d.CompraProveedorID = ?
    ORDER BY d.DetalleCompraID ASC
  `;
  db.query(sql, [id], callback);
};

// ===============================
// Buscar compra existente por factura
// ===============================
Compras.findByFactura = (ProveedorID, NumeroFactura, callback) => {
  const sql = `
    SELECT CompraProveedorID
    FROM compras_proveedor
    WHERE ProveedorID = ? AND NumeroFactura = ?
    LIMIT 1
  `;
  db.query(sql, [ProveedorID, NumeroFactura], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows.length ? rows[0].CompraProveedorID : null);
  });
};

// ===============================
// Crear compra automática UNIFICADA
// (si existe factura, reutiliza compra)
// + inserta detalle + stock + movimiento
// + suma TotalCompra
// ===============================
Compras.crearCompraAutomatica = (data, callback) => {
  const { ProveedorID, FechaCompra, NumeroFactura, Detalle } = data;

  db.beginTransaction(err => {
    if (err) return callback(err);

    Compras.findByFactura(ProveedorID, NumeroFactura, (err, compraID) => {
      if (err) return db.rollback(() => callback(err));

      const crearNuevaCompra = (done) => {
        const sql = `
          INSERT INTO compras_proveedor
          (ProveedorID, FechaCompra, NumeroFactura, TotalCompra)
          VALUES (?, ?, ?, 0)
        `;
        db.query(sql, [ProveedorID, FechaCompra, NumeroFactura], (err, result) => {
          if (err) return db.rollback(() => callback(err));
          done(result.insertId);
        });
      };

      const continuarConCompra = (id) => insertarDetalleYSumarTotal(id);

      if (compraID) continuarConCompra(compraID);
      else crearNuevaCompra(continuarConCompra);

      function insertarDetalleYSumarTotal(compraIDFinal) {
        if (!Array.isArray(Detalle) || Detalle.length === 0) {
          return db.rollback(() => callback(new Error('Detalle vacío')));
        }

        const sqlGetTalla = `
    SELECT TallaID
    FROM variantes_producto
    WHERE VarianteID = ?
    LIMIT 1
  `;

        const sqlDetalle = `
    INSERT INTO detalle_compras
    (CompraProveedorID, TallaID, Cantidad, CostoUnitario)
    VALUES (?, ?, ?, ?)
  `;

        const sqlStock = `
    UPDATE variantes_producto
    SET Stock = Stock + ?
    WHERE VarianteID = ?
  `;

        const sqlMov = `
    INSERT INTO movimientos_stock
    (VarianteID, Tipo, Cantidad, Referencia)
    VALUES (?, 'ENTRADA', ?, ?)
  `;

        let totalSumar = 0;
        let pendientes = Detalle.length;

        Detalle.forEach(d => {
          totalSumar += (d.Cantidad * d.CostoUnitario);

          // 🔥 1. Obtener TallaID desde VarianteID
          db.query(sqlGetTalla, [d.VarianteID], (err, rows) => {
            if (err) return db.rollback(() => callback(err));
            if (!rows.length) {
              return db.rollback(() =>
                callback(new Error(`Variante ${d.VarianteID} no encontrada`))
              );
            }

            const tallaID = rows[0].TallaID;

            // 🔥 2. Insertar detalle_compra con TallaID correcto
            db.query(
              sqlDetalle,
              [compraIDFinal, tallaID, d.Cantidad, d.CostoUnitario],
              (err) => {
                if (err) return db.rollback(() => callback(err));

                // 🔥 3. Actualizar stock
                db.query(sqlStock, [d.Cantidad, d.VarianteID], (err) => {
                  if (err) return db.rollback(() => callback(err));

                  // 🔥 4. Registrar movimiento
                  db.query(
                    sqlMov,
                    [d.VarianteID, d.Cantidad, `FACTURA ${NumeroFactura}`],
                    (err) => {
                      if (err) return db.rollback(() => callback(err));

                      pendientes--;

                      if (pendientes === 0) {
                        db.query(
                          `
                    UPDATE compras_proveedor
                    SET TotalCompra = TotalCompra + ?
                    WHERE CompraProveedorID = ?
                    `,
                          [totalSumar, compraIDFinal],
                          (err) => {
                            if (err) return db.rollback(() => callback(err));
                            db.commit(err =>
                              err ? callback(err) : callback(null)
                            );
                          }
                        );
                      }
                    }
                  );
                });
              }
            );
          });
        });
      }

    });
  });
};

// ===============================
// Pagos: listar pagos de una compra
// ===============================
Compras.getPagos = (CompraProveedorID, callback) => {
  const sql = `
    SELECT PagoID, FechaPago, MontoPagado, MetodoPago, Referencia
    FROM pagos_proveedores
    WHERE CompraProveedorID = ?
    ORDER BY PagoID DESC
  `;
  db.query(sql, [CompraProveedorID], callback);
};

// ===============================
// Pagos: insertar pago y actualizar EstadoPago
// (con validación de saldo)
// ===============================
Compras.registrarPago = (data, callback) => {
  const { CompraProveedorID, FechaPago, MontoPagado, MetodoPago, Referencia } = data;

  db.beginTransaction(err => {
    if (err) return callback(err);

    // 1️⃣ Obtener total de la compra
    db.query(
      `SELECT TotalCompra FROM compras_proveedor WHERE CompraProveedorID = ?`,
      [CompraProveedorID],
      (err, rows) => {
        if (err) return db.rollback(() => callback(err));
        const totalCompra = Number(rows?.[0]?.TotalCompra || 0);

        // 2️⃣ Obtener total ya pagado
        db.query(
          `SELECT COALESCE(SUM(MontoPagado),0) AS TotalPagado
           FROM pagos_proveedores
           WHERE CompraProveedorID = ?`,
          [CompraProveedorID],
          (err, rows2) => {
            if (err) return db.rollback(() => callback(err));
            const totalPagado = Number(rows2?.[0]?.TotalPagado || 0);

            const saldoActual = totalCompra - totalPagado;

            // 🔒 VALIDACIÓN CRÍTICA
            if (MontoPagado > saldoActual) {
              return db.rollback(() =>
                callback(
                  new Error(
                    `El monto excede el saldo pendiente. Saldo actual: $${saldoActual.toFixed(2)}`
                  )
                )
              );
            }

            // 3️⃣ Insertar pago
            const sqlPago = `
              INSERT INTO pagos_proveedores
              (CompraProveedorID, FechaPago, MontoPagado, MetodoPago, Referencia)
              VALUES (?, ?, ?, ?, ?)
            `;
            db.query(
              sqlPago,
              [CompraProveedorID, FechaPago, MontoPagado, MetodoPago, Referencia],
              (err) => {
                if (err) return db.rollback(() => callback(err));

                const nuevoTotalPagado = totalPagado + MontoPagado;

                let nuevoEstado = 'Pendiente';
                if (nuevoTotalPagado <= 0) nuevoEstado = 'Pendiente';
                else if (nuevoTotalPagado + 0.00001 >= totalCompra) nuevoEstado = 'Pagado';
                else nuevoEstado = 'Parcial';

                // 4️⃣ Actualizar estado
                db.query(
                  `UPDATE compras_proveedor
                   SET EstadoPago = ?
                   WHERE CompraProveedorID = ?`,
                  [nuevoEstado, CompraProveedorID],
                  (err) => {
                    if (err) return db.rollback(() => callback(err));
                    db.commit(err => (err ? callback(err) : callback(null)));
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};


module.exports = Compras;
