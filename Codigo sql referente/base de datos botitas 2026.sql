-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 11, 2026 at 09:35 PM
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
-- Database: `calzado_botitas_2026`
--

-- --------------------------------------------------------

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE IF NOT EXISTS `categorias` (
  `CategoriaID` int NOT NULL AUTO_INCREMENT,
  `TipoID` int NOT NULL,
  `GeneroID` int NOT NULL,
  PRIMARY KEY (`CategoriaID`),
  UNIQUE KEY `uk_categoria_completa` (`TipoID`,`GeneroID`),
  KEY `GeneroID` (`GeneroID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
CREATE TABLE IF NOT EXISTS `clientes` (
  `ClienteID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(120) NOT NULL,
  `Celular` varchar(20) DEFAULT NULL,
  `Email` varchar(120) DEFAULT NULL,
  `TipoIdentificacion` enum('Cedula','RUC','Pasaporte') NOT NULL,
  `Identificacion` varchar(25) NOT NULL,
  `Direccion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ClienteID`),
  UNIQUE KEY `uk_identificacion_cliente` (`Identificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `colores`
--

DROP TABLE IF EXISTS `colores`;
CREATE TABLE IF NOT EXISTS `colores` (
  `ColorID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(60) NOT NULL,
  `CodigoHex` varchar(7) DEFAULT NULL COMMENT 'Ejemplo: #FF0000',
  PRIMARY KEY (`ColorID`),
  UNIQUE KEY `uk_nombre_color` (`Nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `compras_proveedor`
--

DROP TABLE IF EXISTS `compras_proveedor`;
CREATE TABLE IF NOT EXISTS `compras_proveedor` (
  `CompraProveedorID` int NOT NULL AUTO_INCREMENT,
  `ProveedorID` int NOT NULL,
  `FechaCompra` date NOT NULL,
  `NumeroFactura` varchar(60) DEFAULT NULL,
  `TotalCompra` decimal(12,2) NOT NULL,
  `EstadoPago` enum('Pendiente','Parcial','Pagado') DEFAULT 'Pendiente',
  `Observaciones` text,
  PRIMARY KEY (`CompraProveedorID`),
  KEY `ProveedorID` (`ProveedorID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `detalleventas`
--

DROP TABLE IF EXISTS `detalleventas`;
CREATE TABLE IF NOT EXISTS `detalleventas` (
  `DetalleVentaID` int NOT NULL AUTO_INCREMENT,
  `VentaID` int NOT NULL,
  `ProductoID` int NOT NULL,
  `VarianteID` int NOT NULL,
  `Cantidad` int NOT NULL,
  `PrecioUnitario` decimal(10,2) NOT NULL,
  `Descuento` decimal(10,2) DEFAULT '0.00',
  `SubtotalSinImpuestos` decimal(12,2) GENERATED ALWAYS AS (((`PrecioUnitario` - `Descuento`) * `Cantidad`)) STORED,
  `IvaID` int NOT NULL,
  `IvaValor` decimal(12,2) NOT NULL DEFAULT '0.00',
  `ValorTotal` decimal(12,2) GENERATED ALWAYS AS ((`SubtotalSinImpuestos` + `IvaValor`)) STORED,
  PRIMARY KEY (`DetalleVentaID`),
  KEY `VentaID` (`VentaID`),
  KEY `ProductoID` (`ProductoID`),
  KEY `VarianteID` (`VarianteID`),
  KEY `IvaID` (`IvaID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `Subtotal` decimal(12,2) GENERATED ALWAYS AS ((`Cantidad` * `CostoUnitario`)) STORED,
  PRIMARY KEY (`DetalleCompraID`),
  KEY `CompraProveedorID` (`CompraProveedorID`),
  KEY `TallaID` (`TallaID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
CREATE TABLE IF NOT EXISTS `empresa` (
  `EmpresaID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(120) NOT NULL DEFAULT 'Calzado Botitas',
  `RUC` varchar(20) NOT NULL DEFAULT '9999999990001',
  `Direccion` varchar(255) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Email` varchar(120) DEFAULT NULL,
  `Logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`EmpresaID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `generos`
--

DROP TABLE IF EXISTS `generos`;
CREATE TABLE IF NOT EXISTS `generos` (
  `GeneroID` int NOT NULL AUTO_INCREMENT,
  `Nombre` enum('Hombre','Mujer','Niño','Niña','Unisex') NOT NULL,
  PRIMARY KEY (`GeneroID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materiales`
--

DROP TABLE IF EXISTS `materiales`;
CREATE TABLE IF NOT EXISTS `materiales` (
  `MaterialID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(60) NOT NULL,
  PRIMARY KEY (`MaterialID`),
  UNIQUE KEY `uk_nombre_material` (`Nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `movimientos_stock`
--

DROP TABLE IF EXISTS `movimientos_stock`;
CREATE TABLE IF NOT EXISTS `movimientos_stock` (
  `MovimientoID` int NOT NULL AUTO_INCREMENT,
  `VarianteID` int NOT NULL,
  `Tipo` enum('ENTRADA','SALIDA') NOT NULL,
  `Cantidad` int NOT NULL,
  `Referencia` varchar(100) DEFAULT NULL,
  `Fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MovimientoID`),
  KEY `VarianteID` (`VarianteID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pagos_proveedores`
--

DROP TABLE IF EXISTS `pagos_proveedores`;
CREATE TABLE IF NOT EXISTS `pagos_proveedores` (
  `PagoID` int NOT NULL AUTO_INCREMENT,
  `CompraProveedorID` int NOT NULL,
  `FechaPago` date NOT NULL,
  `MontoPagado` decimal(12,2) NOT NULL,
  `MetodoPago` enum('Transferencia','Efectivo','Cheque','Tarjeta','Otro') DEFAULT 'Transferencia',
  `Referencia` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`PagoID`),
  KEY `CompraProveedorID` (`CompraProveedorID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
CREATE TABLE IF NOT EXISTS `productos` (
  `ProductoID` int NOT NULL AUTO_INCREMENT,
  `Codigo` varchar(50) NOT NULL,
  `Nombre` varchar(200) NOT NULL,
  `CategoriaID` int NOT NULL,
  `Detalle` text,
  `Foto` varchar(255) DEFAULT NULL COMMENT 'Foto representativa del modelo',
  `PrecioCosto` decimal(10,2) NOT NULL,
  `PrecioVenta` decimal(10,2) NOT NULL,
  `Estado` enum('activo','inactivo') DEFAULT 'activo',
  `FechaCreacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ProductoID`),
  UNIQUE KEY `Codigo` (`Codigo`),
  KEY `CategoriaID` (`CategoriaID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE IF NOT EXISTS `proveedores` (
  `ProveedorID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(120) NOT NULL,
  `Contacto` varchar(100) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Email` varchar(120) DEFAULT NULL,
  `Direccion` varchar(255) DEFAULT NULL,
  `RUC` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ProveedorID`),
  UNIQUE KEY `uk_email_proveedor` (`Email`),
  UNIQUE KEY `uk_ruc_proveedor` (`RUC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tallas`
--

DROP TABLE IF EXISTS `tallas`;
CREATE TABLE IF NOT EXISTS `tallas` (
  `TallaID` int NOT NULL AUTO_INCREMENT,
  `Valor` varchar(10) NOT NULL COMMENT 'Ej: 36, 37, 8.5 US, M, L',
  PRIMARY KEY (`TallaID`),
  UNIQUE KEY `uk_valor_talla` (`Valor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tipos`
--

DROP TABLE IF EXISTS `tipos`;
CREATE TABLE IF NOT EXISTS `tipos` (
  `TipoID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(60) NOT NULL,
  PRIMARY KEY (`TipoID`),
  UNIQUE KEY `uk_nombre_tipo` (`Nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tipos de calzado (zapatilla, bota, sandalia, etc.)';

-- --------------------------------------------------------

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
CREATE TABLE IF NOT EXISTS `ubicaciones` (
  `UbicacionID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(60) NOT NULL,
  `Descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`UbicacionID`),
  UNIQUE KEY `uk_nombre_ubicacion` (`Nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `UsuarioID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(120) NOT NULL,
  `Email` varchar(120) NOT NULL,
  `contraseña` varchar(255) NOT NULL COMMENT 'Usar hash (bcrypt recomendado)',
  `Rol` enum('Administrador','Vendedor','Cajero','Almacen') NOT NULL,
  `Activo` tinyint(1) DEFAULT '1',
  `UltimoAcceso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`UsuarioID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `variantes_producto`
--

DROP TABLE IF EXISTS `variantes_producto`;
CREATE TABLE IF NOT EXISTS `variantes_producto` (
  `VarianteID` int NOT NULL AUTO_INCREMENT,
  `ProductoID` int NOT NULL,
  `TallaID` int NOT NULL,
  `ColorID` int NOT NULL,
  `MaterialID` int NOT NULL,
  `UbicacionID` int DEFAULT NULL,
  `Stock` int NOT NULL DEFAULT '0',
  `FechaIngreso` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `QrCode` varchar(100) NOT NULL,
  `CostoUnitario` decimal(10,2) DEFAULT NULL COMMENT 'Costo real de esta variante (opcional)',
  `PrecioVentaVariante` decimal(10,2) DEFAULT NULL COMMENT 'Precio especial si aplica (opcional)',
  PRIMARY KEY (`VarianteID`),
  UNIQUE KEY `QrCode` (`QrCode`),
  UNIQUE KEY `uk_variante_unica` (`ProductoID`,`TallaID`,`ColorID`,`MaterialID`),
  KEY `TallaID` (`TallaID`),
  KEY `ColorID` (`ColorID`),
  KEY `MaterialID` (`MaterialID`),
  KEY `UbicacionID` (`UbicacionID`),
  KEY `idx_producto` (`ProductoID`),
  KEY `idx_qr` (`QrCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
CREATE TABLE IF NOT EXISTS `ventas` (
  `VentaID` int NOT NULL AUTO_INCREMENT,
  `ClienteID` int DEFAULT NULL,
  `EmpresaID` int NOT NULL,
  `UsuarioID` int NOT NULL,
  `Fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `FormaDePago` enum('Efectivo','Transferencia','Tarjeta Debito','Tarjeta Credito','Otro') NOT NULL,
  `Subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `DescuentoTotal` decimal(12,2) DEFAULT '0.00',
  `IvaValor` decimal(12,2) DEFAULT '0.00',
  `TotalVenta` decimal(12,2) NOT NULL,
  `Estado` enum('Completada','Anulada','Pendiente') DEFAULT 'Completada',
  `NumeroFacturaSri` varchar(50) DEFAULT NULL COMMENT 'Ej: 001-001-000000001',
  `ClaveAcceso` varchar(49) DEFAULT NULL COMMENT 'Clave de acceso SRI (49 dígitos)',
  `EstadoSri` enum('PENDIENTE','AUTORIZADO','RECHAZADO','NO_ENVIADO','ANULADO') DEFAULT 'PENDIENTE',
  `FechaAutorizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`VentaID`),
  KEY `ClienteID` (`ClienteID`),
  KEY `EmpresaID` (`EmpresaID`),
  KEY `fk_ventas_usuarios_nuevo` (`UsuarioID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categorias`
--
ALTER TABLE `categorias`
  ADD CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`TipoID`) REFERENCES `tipos` (`TipoID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `categorias_ibfk_2` FOREIGN KEY (`GeneroID`) REFERENCES `generos` (`GeneroID`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
  ADD CONSTRAINT `detalleventas_ibfk_3` FOREIGN KEY (`VarianteID`) REFERENCES `variantes_producto` (`VarianteID`) ON DELETE RESTRICT,
  ADD CONSTRAINT `detalleventas_ibfk_4` FOREIGN KEY (`IvaID`) REFERENCES `iva` (`IvaID`) ON DELETE RESTRICT;

--
-- Constraints for table `detalle_compras`
--
ALTER TABLE `detalle_compras`
  ADD CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`CompraProveedorID`) REFERENCES `compras_proveedor` (`CompraProveedorID`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_compras_ibfk_2` FOREIGN KEY (`TallaID`) REFERENCES `tallas` (`TallaID`) ON DELETE RESTRICT;

--
-- Constraints for table `movimientos_stock`
--
ALTER TABLE `movimientos_stock`
  ADD CONSTRAINT `movimientos_stock_ibfk_1` FOREIGN KEY (`VarianteID`) REFERENCES `variantes_producto` (`VarianteID`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pagos_proveedores`
--
ALTER TABLE `pagos_proveedores`
  ADD CONSTRAINT `pagos_proveedores_ibfk_1` FOREIGN KEY (`CompraProveedorID`) REFERENCES `compras_proveedor` (`CompraProveedorID`) ON DELETE CASCADE;

--
-- Constraints for table `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`CategoriaID`) REFERENCES `categorias` (`CategoriaID`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `variantes_producto`
--
ALTER TABLE `variantes_producto`
  ADD CONSTRAINT `variantes_producto_ibfk_1` FOREIGN KEY (`ProductoID`) REFERENCES `productos` (`ProductoID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `variantes_producto_ibfk_2` FOREIGN KEY (`TallaID`) REFERENCES `tallas` (`TallaID`) ON DELETE RESTRICT,
  ADD CONSTRAINT `variantes_producto_ibfk_3` FOREIGN KEY (`ColorID`) REFERENCES `colores` (`ColorID`) ON DELETE RESTRICT,
  ADD CONSTRAINT `variantes_producto_ibfk_4` FOREIGN KEY (`MaterialID`) REFERENCES `materiales` (`MaterialID`) ON DELETE RESTRICT,
  ADD CONSTRAINT `variantes_producto_ibfk_5` FOREIGN KEY (`UbicacionID`) REFERENCES `ubicaciones` (`UbicacionID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_ventas_usuarios_nuevo` FOREIGN KEY (`UsuarioID`) REFERENCES `usuarios` (`UsuarioID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`ClienteID`) REFERENCES `clientes` (`ClienteID`) ON DELETE SET NULL,
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`EmpresaID`) REFERENCES `empresa` (`EmpresaID`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
