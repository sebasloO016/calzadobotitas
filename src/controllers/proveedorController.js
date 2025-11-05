const Proveedor = require('../models/proveedorModel');

// ======================================================
// 📋 LISTAR PROVEEDORES
// ======================================================
exports.getProveedoresPage = (req, res) => {
  const q = req.query.q || '';
  Proveedor.search(q, (err, proveedores) => {
    if (err) {
      console.error('❌ Error al cargar proveedores:', err);
      return res.status(500).send('Error al cargar proveedores.');
    }
    res.render('proveedores/verProveedores', { proveedores, q });
  });
};

// ======================================================
// ➕ FORMULARIO CREAR PROVEEDOR
// ======================================================
exports.getCrearProveedorPage = (req, res) => {
  res.render('proveedores/crearProveedor', { error: null });
};

// ======================================================
// 💾 CREAR PROVEEDOR
// ======================================================
exports.addProveedor = (req, res) => {
  const { nombre, contacto, telefono, email, direccion } = req.body;

  if (!nombre) {
    return res.status(400).send('El nombre del proveedor es obligatorio.');
  }

  Proveedor.add(nombre, contacto, telefono, email, direccion, (err) => {
    if (err) {
      console.error('❌ Error al crear proveedor:', err);
      return res.status(500).send('Error al crear proveedor.');
    }
    console.log(`✅ Nuevo proveedor agregado: ${nombre}`);
    res.redirect('/proveedores');
  });
};

// ======================================================
// ✏️ FORMULARIO EDITAR PROVEEDOR
// ======================================================
exports.getEditarProveedorPage = (req, res) => {
  const id = req.params.id;
  Proveedor.findById(id, (err, proveedor) => {
    if (err || !proveedor) {
      return res.status(404).send('Proveedor no encontrado.');
    }
    res.render('proveedores/editarProveedor', { proveedor });
  });
};

// ======================================================
// 🔄 ACTUALIZAR PROVEEDOR
// ======================================================
exports.editProveedor = (req, res) => {
  const id = req.params.id;
  const { nombre, contacto, telefono, email, direccion } = req.body;

  Proveedor.update(id, nombre, contacto, telefono, email, direccion, (err) => {
    if (err) {
      console.error('❌ Error al actualizar proveedor:', err);
      return res.status(500).send('Error al actualizar proveedor.');
    }
    console.log(`✅ Proveedor actualizado ID: ${id}`);
    res.redirect('/proveedores');
  });
};

// ======================================================
// ❌ ELIMINAR PROVEEDOR
// ======================================================
exports.deleteProveedor = (req, res) => {
  const id = req.params.id;
  Proveedor.delete(id, (err) => {
    if (err) {
      console.error('❌ Error al eliminar proveedor:', err);
      return res.status(500).send('Error al eliminar proveedor.');
    }
    console.log(`🗑️ Proveedor eliminado ID: ${id}`);
    res.redirect('/proveedores');
  });
};

// ======================================================
// 🔍 BUSCADOR EN TIEMPO REAL
// ======================================================
exports.buscarProveedores = (req, res) => {
  const texto = (req.query.texto || '').trim();
  if (!texto) return res.json([]);

  Proveedor.search(texto, (err, results) => {
    if (err) {
      console.error('❌ Error al buscar proveedores:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
};
