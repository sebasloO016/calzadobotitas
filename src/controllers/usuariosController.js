const User = require('../models/userModel');

exports.getUsuarios = (req, res) => {
  User.findAll((err, usuarios) => {
    if (err) {
      console.error('Error al obtener los usuarios:', err);
      return res.status(500).render('usuarios/verUsuarios', {
        usuarios: [],
        error: 'Error al obtener los usuarios.'
      });
    }
    res.render('usuarios/verUsuarios', {
      usuarios,
      error: null // Aseguramos que error esté definido
    });
  });
};

exports.editarUsuario = (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol } = req.body;

  User.update(id, nombre, email, rol, (err, results) => {
    if (err) {
      console.error('Error al actualizar el usuario:', err);
      return User.findAll((err, usuarios) => {
        if (err) {
          return res.status(500).render('usuarios/verUsuarios', {
            usuarios: [],
            error: 'Error al obtener los usuarios.'
          });
        }
        res.render('usuarios/verUsuarios', {
          usuarios,
          error: err.message // Mostrar el mensaje de error (por ejemplo, correo duplicado)
        });
      });
    }
    res.redirect('/usuarios');
  });
};

exports.crearUsuario = (req, res) => {
  const { nombre, email, password, rol } = req.body;

  User.create(nombre, email, password, rol, (err, results) => {
    if (err) {
      console.error('Error al crear el usuario:', err);
      return User.findAll((err, usuarios) => {
        if (err) {
          return res.status(500).render('usuarios/verUsuarios', {
            usuarios: [],
            error: 'Error al obtener los usuarios.'
          });
        }
        res.render('usuarios/verUsuarios', {
          usuarios,
          error: err.message // Mostrar el mensaje de error (por ejemplo, correo duplicado)
        });
      });
    }
    res.redirect('/usuarios');
  });
};

exports.eliminarUsuario = (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to delete user with ID: ${id}`); // Debug log

  User.delete(id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el usuario:', err);
      return User.findAll((err, usuarios) => {
        if (err) {
          return res.status(500).render('usuarios/verUsuarios', {
            usuarios: [],
            error: 'Error al obtener los usuarios.'
          });
        }
        res.render('usuarios/verUsuarios', {
          usuarios,
          error: err.message // Mostrar el mensaje de error (por ejemplo, usuario no encontrado)
        });
      });
    }
    res.redirect('/usuarios');
  });
};

module.exports = exports;