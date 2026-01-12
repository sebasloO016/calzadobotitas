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
// (Nota: Se mantiene para usos simples fuera de transacción)
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
// Crear compra automática UNIFICADA - CORREGIDO
// ===============================
Compras.crearCompraAutomatica = (data, callback) => {
  const { ProveedorID, FechaCompra, NumeroFactura, Detalle } = data;

  // 1. Obtener conexión del pool
  db.getConnection((err, conn) => {
    if (err) return callback(err);

    // 2. Iniciar transacción en la conexión
    conn.beginTransaction(err => {
      if (err) {
        conn.release();
        return callback(err);
      }

      // Buscar si existe la factura (Usando conn, NO db)
      conn.query(
        `SELECT CompraProveedorID FROM compras_proveedor WHERE ProveedorID = ? AND NumeroFactura = ? LIMIT 1`,
        [ProveedorID, NumeroFactura],
        (err, rows) => {
          if (err) return conn.rollback(() => { conn.release(); callback(err); });

          const compraIDExistente = rows.length ? rows[0].CompraProveedorID : null;

          const procesarDetalle = (compraIDFinal) => {
            if (!Array.isArray(Detalle) || Detalle.length === 0) {
              return conn.rollback(() => { conn.release(); callback(new Error('Detalle vacío')); });
            }

            // Preparamos los queries
            const sqlGetTalla = `SELECT TallaID FROM variantes_producto WHERE VarianteID = ? LIMIT 1`;
            const sqlDetalle = `INSERT INTO detalle_compras (CompraProveedorID, TallaID, Cantidad, CostoUnitario) VALUES (?, ?, ?, ?)`;
            const sqlStock = `UPDATE variantes_producto SET Stock = Stock + ? WHERE VarianteID = ?`;
            const sqlMov = `INSERT INTO movimientos_stock (VarianteID, Tipo, Cantidad, Referencia) VALUES (?, 'ENTRADA', ?, ?)`;

            let totalSumar = 0;
            let pendientes = Detalle.length;
            let huboError = false;

            Detalle.forEach(d => {
              if (huboError) return;

              totalSumar += (d.Cantidad * d.CostoUnitario);

              // 1. Obtener Talla
              conn.query(sqlGetTalla, [d.VarianteID], (err, tRows) => {
                if (err || !tRows.length) {
                  huboError = true;
                  return conn.rollback(() => { conn.release(); callback(err || new Error(`Variante ${d.VarianteID} no encontrada`)); });
                }
                const tallaID = tRows[0].TallaID;

                // 2. Insertar Detalle
                conn.query(sqlDetalle, [compraIDFinal, tallaID, d.Cantidad, d.CostoUnitario], (err) => {
                  if (err && !huboError) {
                    huboError = true;
                    return conn.rollback(() => { conn.release(); callback(err); });
                  }

                  // 3. Actualizar Stock
                  conn.query(sqlStock, [d.Cantidad, d.VarianteID], (err) => {
                    if (err && !huboError) {
                      huboError = true;
                      return conn.rollback(() => { conn.release(); callback(err); });
                    }

                    // 4. Registrar Movimiento
                    conn.query(sqlMov, [d.VarianteID, d.Cantidad, `FACTURA ${NumeroFactura}`], (err) => {
                      if (err && !huboError) {
                        huboError = true;
                        return conn.rollback(() => { conn.release(); callback(err); });
                      }

                      pendientes--;
                      if (pendientes === 0 && !huboError) {
                        // Actualizar total final
                        conn.query(
                          `UPDATE compras_proveedor SET TotalCompra = TotalCompra + ? WHERE CompraProveedorID = ?`,
                          [totalSumar, compraIDFinal],
                          (err) => {
                            if (err) return conn.rollback(() => { conn.release(); callback(err); });

                            // EXITO FINAL
                            conn.commit(err => {
                              if (err) return conn.rollback(() => { conn.release(); callback(err); });
                              conn.release();
                              callback(null);
                            });
                          }
                        );
                      }
                    });
                  });
                });
              });
            });
          };

          if (compraIDExistente) {
            procesarDetalle(compraIDExistente);
          } else {
            // Crear nueva compra
            conn.query(
              `INSERT INTO compras_proveedor (ProveedorID, FechaCompra, NumeroFactura, TotalCompra) VALUES (?, ?, ?, 0)`,
              [ProveedorID, FechaCompra, NumeroFactura],
              (err, result) => {
                if (err) return conn.rollback(() => { conn.release(); callback(err); });
                procesarDetalle(result.insertId);
              }
            );
          }
        }
      );
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
// Pagos: insertar pago y actualizar EstadoPago - CORREGIDO
// ===============================
Compras.registrarPago = (data, callback) => {
  const { CompraProveedorID, FechaPago, MontoPagado, MetodoPago, Referencia } = data;

  // 1. Obtener conexión
  db.getConnection((err, conn) => {
    if (err) return callback(err);

    // 2. Transacción
    conn.beginTransaction(err => {
      if (err) {
        conn.release();
        return callback(err);
      }

      // Obtener TotalCompra
      conn.query(
        `SELECT TotalCompra FROM compras_proveedor WHERE CompraProveedorID = ?`,
        [CompraProveedorID],
        (err, rows) => {
          if (err) return conn.rollback(() => { conn.release(); callback(err); });

          const totalCompra = Number(rows?.[0]?.TotalCompra || 0);

          // Obtener TotalPagado
          conn.query(
            `SELECT COALESCE(SUM(MontoPagado),0) AS TotalPagado FROM pagos_proveedores WHERE CompraProveedorID = ?`,
            [CompraProveedorID],
            (err, rows2) => {
              if (err) return conn.rollback(() => { conn.release(); callback(err); });

              const totalPagado = Number(rows2?.[0]?.TotalPagado || 0);
              const saldoActual = totalCompra - totalPagado;

              if (MontoPagado > saldoActual + 0.01) { // Pequeña tolerancia de centavos
                return conn.rollback(() => {
                  conn.release();
                  callback(new Error(`El monto excede el saldo pendiente ($${saldoActual.toFixed(2)})`));
                });
              }

              // Insertar Pago
              conn.query(
                `INSERT INTO pagos_proveedores (CompraProveedorID, FechaPago, MontoPagado, MetodoPago, Referencia) VALUES (?, ?, ?, ?, ?)`,
                [CompraProveedorID, FechaPago, MontoPagado, MetodoPago, Referencia],
                (err) => {
                  if (err) return conn.rollback(() => { conn.release(); callback(err); });

                  const nuevoTotalPagado = totalPagado + MontoPagado;
                  let nuevoEstado = 'Pendiente';

                  if (nuevoTotalPagado <= 0) nuevoEstado = 'Pendiente';
                  else if (nuevoTotalPagado + 0.01 >= totalCompra) nuevoEstado = 'Pagado';
                  else nuevoEstado = 'Parcial';

                  // Actualizar Estado
                  conn.query(
                    `UPDATE compras_proveedor SET EstadoPago = ? WHERE CompraProveedorID = ?`,
                    [nuevoEstado, CompraProveedorID],
                    (err) => {
                      if (err) return conn.rollback(() => { conn.release(); callback(err); });

                      // EXITO
                      conn.commit(err => {
                        if (err) return conn.rollback(() => { conn.release(); callback(err); });
                        conn.release();
                        callback(null);
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};

module.exports = Compras;