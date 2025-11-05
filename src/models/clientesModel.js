//modelo
// clientesModel.js
const db = require('../db/db');

const Cliente = {};

Cliente.create = (cliente, callback) => {
    const query = 'INSERT INTO clientes (Nombre, Celular, Email, TipoIdentificacion, Identificacion, Direccion) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [cliente.Nombre, cliente.Celular, cliente.Email, cliente.TipoIdentificacion, cliente.Identificacion, cliente.Direccion];
    db.query(query, values, callback);
};

Cliente.findByIdentificacion = (identificacion, callback) => {
    const query = 'SELECT * FROM clientes WHERE Identificacion = ?';
    db.query(query, [identificacion], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results[0]);
        }
    });
};

Cliente.getAll = (callback) => {
    const query = 'SELECT * FROM clientes';
    db.query(query, (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
};

Cliente.search = (termino, callback) => {
    const query = 'SELECT * FROM clientes WHERE Nombre LIKE ? OR Identificacion LIKE ?';
    db.query(query, [`%${termino}%`, `%${termino}%`], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
};

module.exports = Cliente;