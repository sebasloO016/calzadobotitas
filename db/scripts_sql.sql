-- Crear la base de datos
CREATE DATABASE BOTITAS;

-- Usar la base de datos recién creada
USE BOTITAS;
//RUTAS DEL PROYECTO...
INVENTARIO_BOTITAS/
├── public/
│   ├── index.html
│   ├── register.html
│   ├── admin-dashboard.ejs
│   ├── employee-dashboard.ejs
│   ├── inventario/
│   │   ├── agregarProducto.ejs
│   │   ├── editarProducto.ejs
│   │   ├── stockUbicacion.ejs
│   │   └── verInventario.ejs
│   ├── crearProducto/
│   │   ├── crearProducto.ejs
│   │   ├── editarProducto.ejs
│   │   ├── eliminarProducto.ejs
│   │   └── verProducto.ejs
│   ├── proveedores/
│   │   ├── crearProveedor.ejs
│   │   ├── editarProveedor.ejs
│   │   └── verProveedores.ejs
│   ├── ventas/
│   │   ├── nuevaVenta.ejs
│   │   ├── historialVentas.ejs
│   │   ├── detalleVenta.ejs
│   ├── clientes/
│   │   ├── verClientes.ejs
│   ├── usuarios/
│   │   ├── verUsuarios.ejs
│   ├── reportes/
│   │   ├── dashboard.ejs      
│   └── imagenes/
│       └── logo botitas.png
│ 
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── loginRoutes.js
│   │   ├── inventarioRoutes.js
│   │   ├── crearProductoRoutes.js
│   │   ├── proveedoresRoutes.js
│   │   ├── ventasRoutes.js
│   │   ├── clientesRoutes.js
│   │   ├── usuariosRoutes.js
│   │   ├── comprasRoutes.js
│   │   ├── reportesRoutes.js  // Nueva ruta para reportes
│   ├── controllers/
│   │   ├── loginController.js
│   │   ├── inventarioController.js
│   │   ├── crearProductoController.js
│   │   ├── proveedorController.js
│   │   ├── ventasController.js
│   │   ├── clientesController.js
│   │   ├── usuariosController.js
│   │   ├── reportesController.js 
│   │   ├── comprasController.js 
│   ├── models/
│   │   ├── userModel.js
│   │   ├── inventarioModel.js
│   │   ├── crearProductoModel.js
│   │   ├── proveedorModel.js
│   │   ├── ventasModel.js
│   │   ├── detalleVentasModel.js
│   │   └── clientesModel.js
│   │   └── comprasModel.js
│   ├── db/
│   │   └── db.js
├── db/
│   └── scripts_sql.sql
└── package.json



BACKGROUND=#purple;
///BASE DE DATOS BIEN HECHA:
CREATE DATABASE IF NOT EXISTS nuevo_inventario_db;
USE nuevo_inventario_db;

-- Crear la tabla Usuarios
CREATE TABLE Usuarios (
    UsuarioID INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Contraseña VARCHAR(100) NOT NULL,
    Rol ENUM('Administrador', 'Empleado') NOT NULL
);

-- Crear la tabla Proveedores
CREATE TABLE Proveedores (
    ProveedorID INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100) NOT NULL,
    Contacto VARCHAR(100),
    Telefono VARCHAR(20),
    Email VARCHAR(100),
    Direccion VARCHAR(255),
    QueVende VARCHAR(255)
);

CREATE TABLE crearProducto (
    codigo VARCHAR PRIMARY KEY,
    ProveedorID INT,
    QueVende VARCHAR(255),
    Color VARCHAR(50),
    Detalle TEXT,
    Material ENUM('Cuero', 'Sintetico', 'Otro'),
    Categoria ENUM('Botin', 'Bota', 'Casual', 'Deportivo'),
    Genero ENUM('H', 'M'),
    FOREIGN KEY (ProveedorID) REFERENCES Proveedores(ProveedorID)
);
-- Crea la tabla Productos
CREATE TABLE Productos (
    ProductoID INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(255) NOT NULL,
    IDFactura INT,
    Ubicacion VARCHAR(255),
    PrecioCosto DECIMAL(10, 2) NOT NULL,
    PrecioVenta DECIMAL(10, 2) AS (PrecioCosto * 1.15) STORED,
    InversionTotal DECIMAL(10, 2),
    cantidad INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (codigo) REFERENCES crearProducto(codigo)
);


-- Crea la tabla TallasProducto
CREATE TABLE TallasProducto (
    ProductoID INT PRIMARY KEY,
    Talla21 INT DEFAULT 0,
    Talla22 INT DEFAULT 0,
    Talla23 INT DEFAULT 0,
    Talla24 INT DEFAULT 0,
    Talla25 INT DEFAULT 0,
    Talla26 INT DEFAULT 0,
    Talla27 INT DEFAULT 0,
    Talla28 INT DEFAULT 0,
    Talla29 INT DEFAULT 0,
    Talla30 INT DEFAULT 0,
    Talla31 INT DEFAULT 0,
    Talla32 INT DEFAULT 0,
    Talla33 INT DEFAULT 0,
    Talla34 INT DEFAULT 0,
    Talla35 INT DEFAULT 0,
    Talla36 INT DEFAULT 0,
    Talla37 INT DEFAULT 0,
    Talla38 INT DEFAULT 0,
    Talla39 INT DEFAULT 0,
    Talla40 INT DEFAULT 0,
    Talla41 INT DEFAULT 0,
    Talla42 INT DEFAULT 0,
    Talla43 INT DEFAULT 0,
    FOREIGN KEY (ProductoID) REFERENCES Productos(ProductoID)
);
CREATE TABLE Clientes (
    ClienteID INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100) NOT NULL,
    Celular VARCHAR(20),
    Email VARCHAR(100),
    TipoIdentificacion ENUM('Cedula', 'RUC', 'Pasaporte') NOT NULL,
    Identificacion VARCHAR(50) UNIQUE NOT NULL,
    Direccion VARCHAR(255)
);

CREATE TABLE Ventas (
    VentaID INT PRIMARY KEY AUTO_INCREMENT,
    ClienteID INT,
    Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FormaDePago ENUM('Tarjeta de Credito', 'Tarjeta de Debito', 'Efectivo/Transferencia') NOT NULL,
    SubtotalSinImpuestos DECIMAL(10, 2) NOT NULL,
    IVA15Porciento DECIMAL(10, 2) GENERATED ALWAYS AS (SubtotalSinImpuestos * 0.15) STORED,
    ValorTotal DECIMAL(10, 2) GENERATED ALWAYS AS (SubtotalSinImpuestos + IVA15Porciento) STORED,
    FOREIGN KEY (ClienteID) REFERENCES Clientes(ClienteID)
);

CREATE TABLE DetalleVentas (
    DetalleVentaID INT PRIMARY KEY AUTO_INCREMENT,
    VentaID INT,
    ProductoID INT,
    Cantidad INT NOT NULL,
    Precio DECIMAL(10, 2) NOT NULL,
    Descuento DECIMAL(10, 2) DEFAULT 0,
    Total DECIMAL(10, 2) GENERATED ALWAYS AS ((Precio - Descuento) * Cantidad) STORED,
    FOREIGN KEY (VentaID) REFERENCES Ventas(VentaID),
    FOREIGN KEY (ProductoID) REFERENCES Productos(ProductoID)
);
ALTER TABLE DetalleVentas ADD COLUMN Talla INT;
