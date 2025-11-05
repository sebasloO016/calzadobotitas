const User = require('../models/userModel');
const path = require('path');

exports.getLoginPage = (req, res) => {
  console.log('Sirviendo index.html');
  res.sendFile(path.join(__dirname, '../../public/index.html'));
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received with email:', email, 'password:', password);
  User.authenticate(email, password, (err, user) => {
    if (err) {
      console.error('Error al autenticar:', err);
      return res.status(400).json({ error: err.message });
    }
    req.session.user = {
      id: user.UsuarioID,
      nombre: user.Nombre,
      email: user.Email,
      rol: user.Rol
    };
    console.log('Sesión establecida:', req.session.user);
    res.json({ redirect: user.Rol === 'Administrador' ? '/admin-dashboard' : '/employee-dashboard' });
  });
};

exports.register = (req, res) => {
  const { nombre, email, password, rol } = req.body;
  console.log('Register request received with email:', email, 'rol:', rol);
  User.create(nombre, email, password, rol, (err, result) => {
    if (err) {
      console.error('Error al registrar:', err);
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Usuario registrado exitosamente' });
  });
};

exports.getAdminDashboard = (req, res) => {
  if (!req.session.user || req.session.user.rol !== 'Administrador') {
    console.log('Acceso denegado a /admin-dashboard, sesión:', req.session.user);
    return res.redirect('/auth/login');
  }
  try {
    console.log('Renderizando admin-dashboard para:', req.session.user.nombre);
    res.render('admin-dashboard', { userName: req.session.user.nombre });
  } catch (err) {
    console.error('Error al renderizar admin-dashboard:', err);
    res.status(500).json({ error: 'Error al cargar el dashboard' });
  }
};

exports.getEmployeeDashboard = (req, res) => {
  if (!req.session.user || req.session.user.rol !== 'Empleado') {
    console.log('Acceso denegado a /employee-dashboard, sesión:', req.session.user);
    return res.redirect('/auth/login');
  }
  try {
    console.log('Renderizando employee-dashboard para:', req.session.user.nombre);
    res.render('employee-dashboard', { userName: req.session.user.nombre });
  } catch (err) {
    console.error('Error al renderizar employee-dashboard:', err);
    res.status(500).json({ error: 'Error al cargar el dashboard' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.redirect('/admin-dashboard');
    }
    console.log('Sesión destruida, redirigiendo a /auth/login');
    res.redirect('/auth/login');
  });
};

module.exports = exports;