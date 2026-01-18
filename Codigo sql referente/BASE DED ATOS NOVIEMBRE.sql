-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 01, 2025 at 10:04 PM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `try2`
--

-- --------------------------------------------------------

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE IF NOT EXISTS `categorias` (
  `CategoriaID` int NOT NULL AUTO_INCREMENT,
  `TipoID` int NOT NULL,
  `MaterialID` int NOT NULL,
  `GeneroID` int NOT NULL,
  `ColorID` int NOT NULL,
  PRIMARY KEY (`CategoriaID`),
  KEY `TipoID` (`TipoID`),
  KEY `MaterialID` (`MaterialID`),
  KEY `GeneroID` (`GeneroID`),
  KEY `ColorID` (`ColorID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categorias`
--

INSERT INTO `categorias` (`CategoriaID`, `TipoID`, `MaterialID`, `GeneroID`, `ColorID`) VALUES
(1, 1, 1, 1, 1),
(2, 2, 1, 2, 3),
(3, 3, 2, 2, 2),
(4, 2, 1, 2, 3);

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
CREATE TABLE IF NOT EXISTS `clientes` (
  `ClienteID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Celular` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `TipoIdentificacion` enum('Cedula','RUC','Pasaporte') NOT NULL,
  `Identificacion` varchar(50) NOT NULL,
  `Direccion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ClienteID`),
  UNIQUE KEY `Identificacion` (`Identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clientes`
--

INSERT INTO `clientes` (`ClienteID`, `Nombre`, `Celular`, `Email`, `TipoIdentificacion`, `Identificacion`, `Direccion`) VALUES
(1, 'Ana Gómez', '0991111111', 'ana.gomez@example.com', 'Cedula', '1712345678', 'Calle 789, Ambato'),
(2, 'Carlos Ruiz', '0992222222', 'carlos.ruiz@example.com', 'RUC', '1723456789001', 'Av. 101, Cuenca'),
(3, 'Lucía Martínez', '0993333333', 'lucia.martinez@example.com', 'Cedula', '1734567890', 'Calle 202, Quito');

-- --------------------------------------------------------

--
-- Table structure for table `colores`
--

DROP TABLE IF EXISTS `colores`;
CREATE TABLE IF NOT EXISTS `colores` (
  `ColorID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`ColorID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `colores`
--

INSERT INTO `colores` (`ColorID`, `Nombre`) VALUES
(1, 'Negro'),
(2, 'Blanco'),
(3, 'Café'),
(4, 'Marrón');

-- --------------------------------------------------------

--
-- Table structure for table `compras_proveedor`
--

DROP TABLE IF EXISTS `compras_proveedor`;
CREATE TABLE IF NOT EXISTS `compras_proveedor` (
  `CompraProveedorID` int NOT NULL AUTO_INCREMENT,
  `ProveedorID` int NOT NULL,
  `FechaCompra` date NOT NULL,
  `NumeroFactura` varchar(100) DEFAULT NULL,
  `TotalCompra` decimal(10,2) NOT NULL,
  `EstadoPago` enum('Pendiente','Parcial','Pagado') DEFAULT 'Pendiente',
  PRIMARY KEY (`CompraProveedorID`),
  KEY `ProveedorID` (`ProveedorID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `compras_proveedor`
--

INSERT INTO `compras_proveedor` (`CompraProveedorID`, `ProveedorID`, `FechaCompra`, `NumeroFactura`, `TotalCompra`, `EstadoPago`) VALUES
(1, 4, '2025-05-27', 'FAC001', 650.00, 'Pendiente'),
(2, 4, '2025-05-28', 'FAC002', 690.00, 'Pendiente'),
(3, 5, '2025-05-29', 'FAC003', 450.00, 'Pagado'),
(4, 6, '2025-05-30', 'FAC004', 800.00, 'Parcial'),
(9, 5, '2025-08-24', '0000009', 75.00, 'Pendiente'),
(10, 4, '2025-10-10', '125555000555555', 140.00, 'Pendiente');

-- --------------------------------------------------------

--
-- Table structure for table `detalleventas`
--

DROP TABLE IF EXISTS `detalleventas`;
CREATE TABLE IF NOT EXISTS `detalleventas` (
  `DetalleVentaID` int NOT NULL AUTO_INCREMENT,
  `VentaID` int NOT NULL,
  `ProductoID` int NOT NULL,
  `Cantidad` int NOT NULL,
  `Precio` decimal(10,2) NOT NULL,
  `Descuento` decimal(10,2) DEFAULT '0.00',
  `SubtotalSinImpuestos` decimal(10,2) GENERATED ALWAYS AS (((`Precio` - `Descuento`) * `Cantidad`)) STORED,
  `IvaID` int NOT NULL,
  `IvaValor` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ValorTotal` decimal(10,2) GENERATED ALWAYS AS ((`SubtotalSinImpuestos` + `IvaValor`)) STORED,
  PRIMARY KEY (`DetalleVentaID`),
  KEY `VentaID` (`VentaID`),
  KEY `ProductoID` (`ProductoID`),
  KEY `IvaID` (`IvaID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `detalleventas`
--

INSERT INTO `detalleventas` (`DetalleVentaID`, `VentaID`, `ProductoID`, `Cantidad`, `Precio`, `Descuento`, `IvaID`, `IvaValor`) VALUES
(1, 1, 1, 2, 30.00, 0.00, 2, 0.00),
(2, 1, 2, 3, 31.50, 1.50, 2, 0.00),
(3, 2, 6, 5, 22.50, 0.00, 1, 0.00),
(4, 2, 8, 1, 45.00, 5.00, 2, 0.00),
(5, 3, 3, 4, 33.00, 0.00, 2, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `detalle_compras`
--

DROP TABLE IF EXISTS `detalle_compras`;
CREATE TABLE IF NOT EXISTS `detalle_compras` (
  `DetalleCompraID` int NOT NULL AUTO_INCREMENT,
  `CompraProveedorID` int NOT NULL,
  `TallaID` int NOT NULL,
  `Cantidad` int NOT NULL,
  `CostoUnitario` decimal(10,2) NOT NULL,
  `Subtotal` decimal(10,2) GENERATED ALWAYS AS ((`Cantidad` * `CostoUnitario`)) STORED,
  PRIMARY KEY (`DetalleCompraID`),
  KEY `CompraProveedorID` (`CompraProveedorID`),
  KEY `TallaID` (`TallaID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `detalle_compras`
--

INSERT INTO `detalle_compras` (`DetalleCompraID`, `CompraProveedorID`, `TallaID`, `Cantidad`, `CostoUnitario`) VALUES
(1, 1, 1, 10, 20.00),
(2, 1, 2, 15, 21.00),
(3, 1, 3, 20, 22.00),
(4, 2, 1, 5, 23.00),
(5, 2, 2, 10, 24.00),
(6, 3, 4, 10, 25.00),
(7, 3, 5, 10, 26.00),
(8, 4, 1, 15, 15.00),
(9, 4, 2, 10, 16.00),
(10, 4, 5, 5, 30.00),
(11, 9, 1, 1, 25.00),
(12, 9, 2, 1, 25.00),
(13, 9, 1, 1, 25.00),
(14, 10, 9, 2, 35.00),
(15, 10, 10, 2, 35.00);

-- --------------------------------------------------------

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
CREATE TABLE IF NOT EXISTS `empresa` (
  `EmpresaID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL DEFAULT 'Calzado S.A.',
  `RUC` varchar(50) NOT NULL DEFAULT '1234567890001',
  `Direccion` varchar(255) NOT NULL DEFAULT 'Av. Principal 123, Ambato, Ecuador',
  `Telefono` varchar(20) NOT NULL DEFAULT '0999999999',
  `Email` varchar(100) NOT NULL DEFAULT 'contacto@calzadosa.com',
  PRIMARY KEY (`EmpresaID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `empresa`
--

INSERT INTO `empresa` (`EmpresaID`, `Nombre`, `RUC`, `Direccion`, `Telefono`, `Email`) VALUES
(1, 'MiEmpresa S.A.', '0999999999001', 'Av. Siempre Viva 742', '0999999999', 'contacto@calzadosa.com');

-- --------------------------------------------------------

--
-- Table structure for table `generos`
--

DROP TABLE IF EXISTS `generos`;
CREATE TABLE IF NOT EXISTS `generos` (
  `GeneroID` int NOT NULL AUTO_INCREMENT,
  `Nombre` enum('Hombre','Mujer','Unisex') NOT NULL,
  PRIMARY KEY (`GeneroID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `generos`
--

INSERT INTO `generos` (`GeneroID`, `Nombre`) VALUES
(1, 'Hombre'),
(2, 'Mujer'),
(3, 'Unisex');

-- --------------------------------------------------------

--
-- Table structure for table `iva`
--

DROP TABLE IF EXISTS `iva`;
CREATE TABLE IF NOT EXISTS `iva` (
  `IvaID` int NOT NULL AUTO_INCREMENT,
  `Porcentaje` decimal(5,2) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  `Estado` enum('activo','inactivo') DEFAULT 'activo',
  PRIMARY KEY (`IvaID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `iva`
--

INSERT INTO `iva` (`IvaID`, `Porcentaje`, `Descripcion`, `Estado`) VALUES
(1, 15.00, 'IVA 15%', 'activo'),
(2, 0.00, 'IVA 0%', 'activo');

-- --------------------------------------------------------

--
-- Table structure for table `materiales`
--

DROP TABLE IF EXISTS `materiales`;
CREATE TABLE IF NOT EXISTS `materiales` (
  `MaterialID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`MaterialID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `materiales`
--

INSERT INTO `materiales` (`MaterialID`, `Nombre`) VALUES
(1, 'Cuero'),
(2, 'Sintético'),
(3, 'Tela');

-- --------------------------------------------------------

--
-- Table structure for table `pagos_proveedores`
--

DROP TABLE IF EXISTS `pagos_proveedores`;
CREATE TABLE IF NOT EXISTS `pagos_proveedores` (
  `PagoID` int NOT NULL AUTO_INCREMENT,
  `CompraProveedorID` int NOT NULL,
  `FechaPago` date NOT NULL,
  `MontoPagado` decimal(10,2) NOT NULL,
  `MetodoPago` enum('Transferencia','Efectivo','Cheque','Otro') DEFAULT 'Transferencia',
  PRIMARY KEY (`PagoID`),
  KEY `CompraProveedorID` (`CompraProveedorID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pagos_proveedores`
--

INSERT INTO `pagos_proveedores` (`PagoID`, `CompraProveedorID`, `FechaPago`, `MontoPagado`, `MetodoPago`) VALUES
(1, 3, '2025-05-29', 450.00, 'Transferencia'),
(2, 4, '2025-05-30', 400.00, 'Efectivo');

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
CREATE TABLE IF NOT EXISTS `productos` (
  `ProductoID` int NOT NULL AUTO_INCREMENT,
  `Codigo` varchar(50) NOT NULL,
  `Nombre` varchar(255) NOT NULL,
  `CategoriaID` int NOT NULL,
  `UbicacionID` int DEFAULT NULL,
  `TallaID` int NOT NULL,
  `Detalle` text,
  `Foto` varchar(255) DEFAULT NULL,
  `Estado` enum('activo','inactivo') DEFAULT 'activo',
  `PrecioCosto` decimal(10,2) NOT NULL,
  `PrecioVenta` decimal(10,2) NOT NULL,
  `Cantidad` int DEFAULT '0',
  `Fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `DetalleCompraID` int DEFAULT NULL,
  PRIMARY KEY (`ProductoID`),
  UNIQUE KEY `Codigo` (`Codigo`),
  KEY `CategoriaID` (`CategoriaID`),
  KEY `UbicacionID` (`UbicacionID`),
  KEY `TallaID` (`TallaID`),
  KEY `DetalleCompraID` (`DetalleCompraID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`ProductoID`, `Codigo`, `Nombre`, `CategoriaID`, `UbicacionID`, `TallaID`, `Detalle`, `Foto`, `Estado`, `PrecioCosto`, `PrecioVenta`, `Cantidad`, `Fecha`, `DetalleCompraID`) VALUES
(1, 'ZAP001-31', 'Zapato Modelo A Talla 31', 1, NULL, 1, NULL, NULL, 'activo', 20.00, 30.00, 0, '2025-05-27 18:29:54', 1),
(2, 'ZAP001-32', 'Zapato Modelo A Talla 32', 1, NULL, 2, NULL, NULL, 'activo', 21.00, 31.50, 0, '2025-05-27 18:29:54', 2),
(3, 'ZAP001-33', 'Zapato Modelo A Talla 33', 1, NULL, 3, NULL, NULL, 'activo', 22.00, 33.00, 0, '2025-05-27 18:29:54', 3),
(4, 'ZAP002-34', 'Zapato Modelo B Talla 34', 2, NULL, 4, NULL, NULL, 'activo', 25.00, 37.50, 0, '2025-05-27 18:29:54', 6),
(5, 'ZAP002-35', 'Zapato Modelo B Talla 35', 2, NULL, 5, NULL, NULL, 'activo', 26.00, 39.00, 0, '2025-05-27 18:29:54', 7),
(6, 'SAN001-31', 'Sandalia Modelo C Talla 31', 3, NULL, 1, NULL, NULL, 'activo', 15.00, 22.50, 0, '2025-05-27 18:29:54', 8),
(7, 'SAN001-32', 'Sandalia Modelo C Talla 32', 3, NULL, 2, NULL, NULL, 'activo', 16.00, 24.00, 0, '2025-05-27 18:29:54', 9),
(8, 'BOT001-35', 'Bota Modelo D Talla 35', 4, NULL, 5, NULL, NULL, 'activo', 30.00, 45.00, 0, '2025-05-27 18:29:54', 10);

-- --------------------------------------------------------

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE IF NOT EXISTS `proveedores` (
  `ProveedorID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Contacto` varchar(100) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Direccion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ProveedorID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `proveedores`
--

INSERT INTO `proveedores` (`ProveedorID`, `Nombre`, `Contacto`, `Telefono`, `Email`, `Direccion`) VALUES
(4, 'adi', 'Juan Pérez', '0999999999', 'proveedor1@example.com', 'Calle 123, Quito'),
(5, 'nik', 'María López', '0988888888', 'proveedor2@example.com', 'Av. 456, Guayaquil'),
(6, 'pum', 'Pedro Sánchez', '0977777777', 'proveedor3@example.com', 'Calle 789, Cuenca');

-- --------------------------------------------------------

--
-- Table structure for table `tallas`
--

DROP TABLE IF EXISTS `tallas`;
CREATE TABLE IF NOT EXISTS `tallas` (
  `TallaID` int NOT NULL AUTO_INCREMENT,
  `Valor` int NOT NULL,
  PRIMARY KEY (`TallaID`),
  UNIQUE KEY `Valor` (`Valor`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tallas`
--

INSERT INTO `tallas` (`TallaID`, `Valor`) VALUES
(1, 31),
(2, 32),
(3, 33),
(4, 34),
(5, 35),
(6, 36),
(7, 37),
(8, 38),
(9, 39),
(10, 40),
(11, 41),
(12, 42),
(13, 43);

-- --------------------------------------------------------

--
-- Table structure for table `tipos`
--

DROP TABLE IF EXISTS `tipos`;
CREATE TABLE IF NOT EXISTS `tipos` (
  `TipoID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`TipoID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tipos`
--

INSERT INTO `tipos` (`TipoID`, `Nombre`) VALUES
(1, 'Zapatos'),
(2, 'Botas'),
(3, 'Sandalias');

-- --------------------------------------------------------

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
CREATE TABLE IF NOT EXISTS `ubicaciones` (
  `UbicacionID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`UbicacionID`),
  UNIQUE KEY `Nombre` (`Nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ubicaciones`
--

INSERT INTO `ubicaciones` (`UbicacionID`, `Nombre`, `Descripcion`) VALUES
(10, 'Bodega Principal', 'Bodega central en Ambato'),
(11, 'Tienda Centro', 'Tienda en el centro comercial'),
(12, 'Almacén Secundario', 'Almacén en Quito');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `UsuarioID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `Rol` enum('Administrador','Empleado') NOT NULL,
  PRIMARY KEY (`UsuarioID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`UsuarioID`, `Nombre`, `Email`, `contraseña`, `Rol`) VALUES
(1, 'Admin', 'admin@calzadosa.com', 'hashed_password_123', 'Administrador'),
(2, 'Empleado 1', 'empleado1@calzadosa.com', 'hashed_password_456', 'Empleado'),
(3, 'Empleado 2', 'empleado2@calzadosa.com', 'hashed_password_789', 'Empleado'),
(4, 'root', 'root@root.com', 'root', 'Administrador'),
(6, 'root', 'root@.com', 'root', 'Administrador'),
(7, 'admin', 'ADMIN@ADMIN.COM', '$2a$10$jfg4jBwDYG4d0XmWElz0nubHJ3gtBsxrVUEIf0il.xNx0U3HZdDKi', 'Administrador');

-- --------------------------------------------------------

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
CREATE TABLE IF NOT EXISTS `ventas` (
  `VentaID` int NOT NULL AUTO_INCREMENT,
  `ClienteID` int DEFAULT NULL,
  `EmpresaID` int NOT NULL,
  `Fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `FormaDePago` enum('Tarjeta de Credito','Tarjeta de Debito','Efectivo/Transferencia') NOT NULL,
  PRIMARY KEY (`VentaID`),
  KEY `ClienteID` (`ClienteID`),
  KEY `EmpresaID` (`EmpresaID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ventas`
--

INSERT INTO `ventas` (`VentaID`, `ClienteID`, `EmpresaID`, `Fecha`, `FormaDePago`) VALUES
(1, 1, 1, '2025-05-27 15:00:00', 'Efectivo/Transferencia'),
(2, 2, 1, '2025-05-28 17:00:00', 'Tarjeta de Credito'),
(3, 3, 1, '2025-05-29 19:00:00', 'Tarjeta de Debito');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categorias`
--
ALTER TABLE `categorias`
  ADD CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`TipoID`) REFERENCES `tipos` (`TipoID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `categorias_ibfk_2` FOREIGN KEY (`MaterialID`) REFERENCES `materiales` (`MaterialID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `categorias_ibfk_3` FOREIGN KEY (`GeneroID`) REFERENCES `generos` (`GeneroID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `categorias_ibfk_4` FOREIGN KEY (`ColorID`) REFERENCES `colores` (`ColorID`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `compras_proveedor`
--
ALTER TABLE `compras_proveedor`
  ADD CONSTRAINT `compras_proveedor_ibfk_1` FOREIGN KEY (`ProveedorID`) REFERENCES `proveedores` (`ProveedorID`) ON DELETE RESTRICT;

--
-- Constraints for table `detalleventas`
--
ALTER TABLE `detalleventas`
  ADD CONSTRAINT `detalleventas_ibfk_1` FOREIGN KEY (`VentaID`) REFERENCES `ventas` (`VentaID`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalleventas_ibfk_2` FOREIGN KEY (`ProductoID`) REFERENCES `productos` (`ProductoID`) ON DELETE RESTRICT,
  ADD CONSTRAINT `detalleventas_ibfk_3` FOREIGN KEY (`IvaID`) REFERENCES `iva` (`IvaID`) ON DELETE RESTRICT;

--
-- Constraints for table `detalle_compras`
--
ALTER TABLE `detalle_compras`
  ADD CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`CompraProveedorID`) REFERENCES `compras_proveedor` (`CompraProveedorID`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_compras_ibfk_2` FOREIGN KEY (`TallaID`) REFERENCES `tallas` (`TallaID`) ON DELETE RESTRICT;

--
-- Constraints for table `pagos_proveedores`
--
ALTER TABLE `pagos_proveedores`
  ADD CONSTRAINT `pagos_proveedores_ibfk_1` FOREIGN KEY (`CompraProveedorID`) REFERENCES `compras_proveedor` (`CompraProveedorID`) ON DELETE CASCADE;

--
-- Constraints for table `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`CategoriaID`) REFERENCES `categorias` (`CategoriaID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `productos_ibfk_3` FOREIGN KEY (`TallaID`) REFERENCES `tallas` (`TallaID`) ON DELETE RESTRICT,
  ADD CONSTRAINT `productos_ibfk_4` FOREIGN KEY (`DetalleCompraID`) REFERENCES `detalle_compras` (`DetalleCompraID`) ON DELETE SET NULL;

--
-- Constraints for table `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`ClienteID`) REFERENCES `clientes` (`ClienteID`) ON DELETE SET NULL,
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`EmpresaID`) REFERENCES `empresa` (`EmpresaID`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
