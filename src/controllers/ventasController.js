// controllers/ventasController.js
const db = require('../db/db');
const ventasModel = require('../models/ventasModel');

// 🔸 Calcular subtotal local
function calcularSubtotal(productos) {
  return productos.reduce((subtotal, p) => subtotal + (p.precio - (p.descuento || 0)) * p.cantidad, 0);
}

// 🟩 Renderizar formulario de nueva venta
exports.getNuevaVenta = (req, res) => {
  res.render('ventas/nuevaVenta');
};

// 🟩 Renderizar historial de ventas
exports.getHistorialVentas = (req, res) => {
  ventasModel.getHistorialVentas((err, results) => {
    if (err) {
      console.error('❌ Error al obtener historial:', err);
      return res.status(500).send('Error al cargar historial.');
    }
    res.render('ventas/historialVentas', { ventas: results });
  });
};

// 🟩 Registrar una nueva venta
exports.postNuevaVenta = (req, res) => {
  const { cliente, formaDePago, productos } = req.body;

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: 'Error al iniciar la transacción.' });

    ventasModel.findClienteByIdentificacion(cliente.identificacion, (err, results) => {
      if (err) return db.rollback(() => res.status(500).json({ error: 'Error al buscar cliente.' }));

      const continuar = (clienteId) => {
        ventasModel.createVenta(clienteId, formaDePago, (err, ventaRes) => {
          if (err) return db.rollback(() => res.status(500).json({ error: 'Error al crear venta.' }));

          const ventaId = ventaRes.insertId;
          const promesas = productos.map(prod => {
            return new Promise((resolve, reject) => {
              ventasModel.findProductoByCodigo(prod.codigo, (err, r) => {
                if (err || r.length === 0) return reject(new Error('Producto no encontrado.'));
                const p = r[0];
                if (p.Cantidad < prod.cantidad) return reject(new Error('Stock insuficiente.'));

                const detalle = {
                  VentaID: ventaId,
                  ProductoID: p.ProductoID,
                  Cantidad: prod.cantidad,
                  Precio: prod.precio,
                  Descuento: prod.descuento || 0,
                  IvaID: 1,
                  IvaValor: 0.00
                };

                ventasModel.createDetalleVenta(detalle, (err) => {
                  if (err) return reject(err);
                  const nuevoStock = p.Cantidad - prod.cantidad;
                  ventasModel.updateStock(p.ProductoID, nuevoStock, err => err ? reject(err) : resolve());
                });
              });
            });
          });

          Promise.all(promesas)
            .then(() => {
              db.commit(err => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar venta.' }));
                res.json({ success: '✅ Venta registrada con éxito.' });
              });
            })
            .catch(err => db.rollback(() => res.status(500).json({ error: err.message })));
        });
      };

      if (results.length > 0) continuar(results[0].ClienteID);
      else {
        ventasModel.createCliente(cliente, (err, result) => {
          if (err) return db.rollback(() => res.status(500).json({ error: 'Error al crear cliente.' }));
          continuar(result.insertId);
        });
      }
    });
  });
};

// 🟩 Buscar cliente
exports.buscarCliente = (req, res) => {
  const { identificacion } = req.params;
  ventasModel.findClienteByIdentificacion(identificacion, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar cliente.' });
    if (results.length === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(results[0]);
  });
};

// 🟩 Buscar producto
exports.buscarProducto = (req, res) => {
  const { codigo } = req.params;
  ventasModel.findProductoByCodigo(codigo, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar producto.' });
    if (results.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(results[0]);
  });
};

// 🟩 Obtener detalle (para modal)
exports.getDetalleVenta = (req, res) => {
  ventasModel.getDetalleVenta(req.params.id, (err, data) => {
    if (err) {
      console.error('❌ Error al obtener detalle:', err);
      return res.status(500).json({ error: 'Error al obtener detalle de la venta.' });
    }
    res.json(data);
  });
};

// 🟩 Anular venta
exports.anularVenta = (req, res) => {
  ventasModel.anularVenta(req.params.id, (err) => {
    if (err) {
      console.error('❌ Error al anular venta:', err);
      return res.status(500).json({ error: 'Error al anular venta.' });
    }
    res.json({ success: '✅ Venta anulada correctamente.' });
  });
};
