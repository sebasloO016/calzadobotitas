necesito hacer que funcione con mi nueba base de datos.
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE IF NOT EXISTS `categorias` (
  `CategoriaID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  `Material` enum('Cuero','Sintetico','Otro') DEFAULT NULL,
  `Genero` enum('H','M') DEFAULT NULL,
  `Color` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`CategoriaID`),
  UNIQUE KEY `Nombre` (`Nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

DROP TABLE IF EXISTS `iva`;
CREATE TABLE IF NOT EXISTS `iva` (
  `IvaID` int NOT NULL AUTO_INCREMENT,
  `Porcentaje` decimal(5,2) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  `Estado` enum('activo','inactivo') DEFAULT 'activo',
  PRIMARY KEY (`IvaID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

DROP TABLE IF EXISTS `tallas`;
CREATE TABLE IF NOT EXISTS `tallas` (
  `TallaID` int NOT NULL AUTO_INCREMENT,
  `Valor` int NOT NULL,
  PRIMARY KEY (`TallaID`),
  UNIQUE KEY `Valor` (`Valor`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ubicaciones`;
CREATE TABLE IF NOT EXISTS `ubicaciones` (
  `UbicacionID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`UbicacionID`),
  UNIQUE KEY `Nombre` (`Nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `UsuarioID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Contraseña` varchar(100) NOT NULL,
  `Rol` enum('Administrador','Empleado') NOT NULL,
  PRIMARY KEY (`UsuarioID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

ALTER TABLE `compras_proveedor`
  ADD CONSTRAINT `compras_proveedor_ibfk_1` FOREIGN KEY (`ProveedorID`) REFERENCES `proveedores` (`ProveedorID`) ON DELETE RESTRICT;

ALTER TABLE `detalleventas`
  ADD CONSTRAINT `detalleventas_ibfk_1` FOREIGN KEY (`VentaID`) REFERENCES `ventas` (`VentaID`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalleventas_ibfk_2` FOREIGN KEY (`ProductoID`) REFERENCES `productos` (`ProductoID`) ON DELETE RESTRICT,
  ADD CONSTRAINT `detalleventas_ibfk_3` FOREIGN KEY (`IvaID`) REFERENCES `iva` (`IvaID`) ON DELETE RESTRICT;

ALTER TABLE `detalle_compras`
  ADD CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`CompraProveedorID`) REFERENCES `compras_proveedor` (`CompraProveedorID`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_compras_ibfk_2` FOREIGN KEY (`TallaID`) REFERENCES `tallas` (`TallaID`) ON DELETE RESTRICT;

ALTER TABLE `pagos_proveedores`
  ADD CONSTRAINT `pagos_proveedores_ibfk_1` FOREIGN KEY (`CompraProveedorID`) REFERENCES `compras_proveedor` (`CompraProveedorID`) ON DELETE CASCADE;

ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`CategoriaID`) REFERENCES `categorias` (`CategoriaID`) ON DELETE RESTRICT,
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`UbicacionID`) REFERENCES `ubicaciones` (`UbicacionID`) ON DELETE SET NULL,
  ADD CONSTRAINT `productos_ibfk_3` FOREIGN KEY (`TallaID`) REFERENCES `tallas` (`TallaID`) ON DELETE RESTRICT,
  ADD CONSTRAINT `productos_ibfk_4` FOREIGN KEY (`DetalleCompraID`) REFERENCES `detalle_compras` (`DetalleCompraID`) ON DELETE SET NULL;

ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`ClienteID`) REFERENCES `clientes` (`ClienteID`) ON DELETE SET NULL,
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`EmpresaID`) REFERENCES `empresa` (`EmpresaID`) ON DELETE RESTRICT;

COMMIT;