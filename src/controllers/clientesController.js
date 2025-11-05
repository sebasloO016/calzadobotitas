//controlador
const Cliente = require('../models/clientesModel');

exports.getClientes = (req, res) => {
    Cliente.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los clientes.' });
        }
        res.render('clientes/verClientes', { clientes: results, termino: req.query.termino });
    });
};

exports.buscarClientes = (req, res) => {
    const { termino } = req.query;
    Cliente.search(termino, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al buscar clientes.' });
        }
        res.render('clientes/verClientes', { clientes: results, termino });
    });
};

exports.mostrarFormularioAgregar = (req, res) => {
    res.render('clientes/agregarCliente', { error: null });
};


exports.crearCliente = (req, res) => {
  const cliente = {
    Nombre: req.body.nombre,
    Celular: req.body.celular,
    Email: req.body.email,
    TipoIdentificacion: req.body.tipoIdentificacion,
    Identificacion: req.body.identificacion,
    Direccion: req.body.direccion
  };

  Cliente.findByIdentificacion(cliente.Identificacion, (err, existente) => {
    if (err) return res.status(500).send('Error al verificar cliente');
    if (existente) {
      return res.render('clientes/agregarCliente', { 
        error: '⚠️ Ya existe un cliente con esa identificación.' 
      });
    }

    Cliente.create(cliente, (err) => {
      if (err) {
        console.error('❌ Error al crear cliente:', err);
        return res.render('clientes/agregarCliente', { error: 'Error al guardar el cliente.' });
      }
      console.log(`✅ Cliente agregado: ${cliente.Nombre}`);
      res.redirect('/clientes');
    });
  });
};


module.exports = exports;