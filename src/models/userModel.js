const db = require('../db/db');
const bcrypt = require('bcryptjs');

const User = {};

User.findByEmail = (email, callback) => {
  console.log('Executing findByEmail with email:', email);
  const query = 'SELECT * FROM usuarios WHERE Email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error in findByEmail:', err);
      return callback(err, null);
    }
    console.log('Query results:', results);
    callback(null, results[0]);
  });
};

User.authenticate = (email, password, callback) => {
  console.log('Authenticating with email:', email, 'password:', password);
  User.findByEmail(email, (err, user) => {
    if (err) {
      console.error('Error in findByEmail:', err);
      return callback(err, null);
    }
    if (!user) {
      console.log('No user found for email:', email);
      return callback(new Error('Usuario no encontrado.'), null);
    }
    console.log('User object retrieved:', user);
    if (!user.contraseña) {
      console.error('Password field (contraseña) is undefined for user:', user);
      return callback(new Error('Error: Campo contraseña no encontrado en el usuario.'), null);
    }
    bcrypt.compare(password, user.contraseña, (err, isMatch) => {
      if (err) {
        console.error('Bcrypt error:', err);
        return callback(err, null);
      }
      if (!isMatch) {
        console.log('Password mismatch for email:', email);
        return callback(new Error('Contraseña incorrecta.'), null);
      }
      console.log('Authentication successful for user:', user);
      callback(null, user);
    });
  });
};

User.create = (nombre, email, password, rol, callback) => {
  console.log('Creating user with email:', email);
  User.findByEmail(email, (err, existingUser) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return callback(err, null);
    }
    if (existingUser) {
      console.log('Email already registered:', email);
      return callback(new Error('El correo electrónico ya está registrado.'), null);
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Bcrypt hash error:', err);
        return callback(err, null);
      }
      const query = 'INSERT INTO usuarios (Nombre, Email, contraseña, Rol) VALUES (?, ?, ?, ?)';
      db.query(query, [nombre, email, hash, rol], (err, results) => {
        if (err) {
          console.error('Database error in create:', err);
          return callback(err, null);
        }
        console.log('User created successfully:', results);
        callback(null, results);
      });
    });
  });
};

User.findAll = (callback) => {
  const query = 'SELECT * FROM usuarios';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error in findAll:', err);
      return callback(err, null);
    }
    console.log('All users retrieved:', results);
    callback(null, results);
  });
};

User.update = (id, nombre, email, rol, callback) => {
  console.log('Updating user with ID:', id);
  User.findByEmail(email, (err, existingUser) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return callback(err, null);
    }
    if (existingUser && existingUser.UsuarioID != id) {
      console.log('Email already registered for another user:', email);
      return callback(new Error('El correo electrónico ya está registrado.'), null);
    }
    const query = 'UPDATE usuarios SET Nombre = ?, Email = ?, Rol = ? WHERE UsuarioID = ?';
    db.query(query, [nombre, email, rol, id], (err, results) => {
      if (err) {
        console.error('Database error in update:', err);
        return callback(err, null);
      }
      console.log('User updated successfully:', results);
      callback(null, results);
    });
  });
};

User.delete = (id, callback) => {
  console.log('Deleting user with ID:', id);
  const query = 'SELECT * FROM usuarios WHERE UsuarioID = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database error in delete check:', err);
      return callback(err, null);
    }
    if (results.length === 0) {
      console.log('User not found for ID:', id);
      return callback(new Error('Usuario no encontrado.'), null);
    }
    const deleteQuery = 'DELETE FROM usuarios WHERE UsuarioID = ?';
    db.query(deleteQuery, [id], (err, results) => {
      if (err) {
        console.error('Database error in delete:', err);
        return callback(err, null);
      }
      console.log('User deleted successfully:', results);
      callback(null, results);
    });
  });
};

module.exports = User;