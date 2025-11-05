const db = require('../db/db');

const DetalleVentas = {};

DetalleVentas.create = (detalleVenta, callback) => {
    const query = 'INSERT INTO DetalleVentas (VentaID, ProductoID, Cantidad, Precio, Descuento) VALUES (?, ?, ?, ?, ?)';
    const values = [detalleVenta.VentaID, detalleVenta.ProductoID, detalleVenta.Cantidad, detalleVenta.Precio, detalleVenta.Descuento];
    db.query(query, values, callback);
};

DetalleVentas.createBatch = (detallesVenta, callback) => {
    const query = 'INSERT INTO DetalleVentas (VentaID, ProductoID, Cantidad, Precio, Descuento) VALUES ?';
    const values = detallesVenta.map(dv => [dv.VentaID, dv.ProductoID, dv.Cantidad, dv.Precio, dv.Descuento]);
    db.query(query, [values], callback);
};

module.exports = DetalleVentas;
