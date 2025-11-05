const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const loginRoutes = require('./routes/loginRoutes');
const proveedoresRoutes = require('./routes/proveedorRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const crearProductoRoutes = require('./routes/crearProductoRoutes');
const stockRoutes = require('./routes/stockRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const reportesRoutes = require('./routes/reportesRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public')); // Restored to original path

// Routes (before static files to prioritize dynamic routes)
app.use('/auth', loginRoutes);
app.use('/proveedores', proveedoresRoutes);
app.use('/inventario', inventarioRoutes);
app.use('/crearProducto', crearProductoRoutes);
app.use('/stock', stockRoutes);
app.use('/ventas', ventasRoutes);
app.use('/clientes', clientesRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/reportes', reportesRoutes);

// Serve static files (after routes to avoid conflicts)
app.use(express.static(path.join(__dirname, '../public')));

// Debug: Log all registered routes
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
    } else if (r.name === 'router' && r.handle.stack) {
        r.handle.stack.forEach((handler) => {
            if (handler.route && handler.route.path) {
                console.log(`${Object.keys(handler.route.methods)} ${r.regexp.source.replace(/\/\^/, '')}${handler.route.path}`);
            }
        });
    }
});

// Root route
app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio' });
});

// Admin dashboard
app.get('/admin-dashboard', (req, res) => {
    if (!req.session.user || req.session.user.rol !== 'Administrador') {
        console.log('Redirigiendo desde /admin-dashboard: Sesión no válida o no es Administrador', req.session.user);
        return res.redirect('/');
    }
    res.render('admin-dashboard', { userName: req.session.user.nombre });
});

// Employee dashboard
app.get('/employee-dashboard', (req, res) => {
    if (!req.session.user || req.session.user.rol !== 'Empleado') {
        console.log('Redirigiendo desde /employee-dashboard: Sesión no válida o no es Empleado', req.session.user);
        return res.redirect('/');
    }
    res.render('employee-dashboard', { userName: req.session.user.nombre });
});

// Test route for debugging
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.send('Server is running');
});

// 404 handler
app.use((req, res, next) => {
    console.log(`404: Route not found - ${req.method} ${req.url}`);
    res.status(404).render('404', {
        title: 'Página no encontrada',
        message: 'Lo sentimos, la página que buscas no existe.'
    });
});

// Start server
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});