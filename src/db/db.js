// src/db/db.js
const mysql = require('mysql2');

// Creamos un "Pool" en lugar de una sola conexión
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Puces4', // Tu contraseña
  database: 'calzado_botitas_2026',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mensaje de confirmación (opcional)
pool.getConnection((err, conn) => {
  if (err) console.error('Error al conectar:', err.message);
  else {
    console.log('✅ Conectado a MySQL como id ' + conn.threadId);
    conn.release(); // Liberar la conexión de prueba
  }
});

// Exportamos el pool directamente
module.exports = pool;