const db = require('../db/db');
const Proveedor = {};

// ======================================================
// 📋 OBTENER TODOS LOS PROVEEDORES
// ======================================================
Proveedor.getAll = (callback) => {
  const sql = `SELECT * FROM proveedores ORDER BY Nombre ASC`;
  db.query(sql, callback);
};

// ======================================================
// 🔍 BUSCAR PROVEEDORES (nombre, contacto, teléfono, email, dirección)
// ======================================================
Proveedor.search = (texto, callback) => {
  const sql = `
    SELECT *
    FROM proveedores
    WHERE
      Nombre LIKE CONCAT('%', ?, '%') OR
      Contacto LIKE CONCAT('%', ?, '%') OR
      Telefono LIKE CONCAT('%', ?, '%') OR
      Email LIKE CONCAT('%', ?, '%') OR
      Direccion LIKE CONCAT('%', ?, '%')
    ORDER BY Nombre ASC;
  `;
  db.query(sql, [texto, texto, texto, texto, texto], callback);
};

// ======================================================
// 🔍 BUSCAR POR ID
// ======================================================
Proveedor.findById = (id, callback) => {
  const sql = `SELECT * FROM proveedores WHERE ProveedorID = ? LIMIT 1`;
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results.length > 0 ? results[0] : null);
  });
};

// ======================================================
// ➕ AGREGAR NUEVO PROVEEDOR
// ======================================================
Proveedor.add = (nombre, contacto, telefono, email, direccion, callback) => {
  const sql = `
    INSERT INTO proveedores (Nombre, Contacto, Telefono, Email, Direccion)
    VALUES (?, ?, ?, ?, ?);
  `;
  db.query(sql, [nombre, contacto, telefono, email, direccion], callback);
};

// ======================================================
// ✏️ ACTUALIZAR PROVEEDOR
// ======================================================
Proveedor.update = (id, nombre, contacto, telefono, email, direccion, callback) => {
  const sql = `
    UPDATE proveedores
    SET Nombre = ?, Contacto = ?, Telefono = ?, Email = ?, Direccion = ?
    WHERE ProveedorID = ?;
  `;
  db.query(sql, [nombre, contacto, telefono, email, direccion, id], callback);
};

// ======================================================
// ❌ ELIMINAR PROVEEDOR
// ======================================================
Proveedor.delete = (id, callback) => {
  const sql = `DELETE FROM proveedores WHERE ProveedorID = ?`;
  db.query(sql, [id], callback);
};

module.exports = Proveedor;
