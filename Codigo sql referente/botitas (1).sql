-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 05, 2025 at 02:53 AM
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
-- Database: `botitas`
--

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
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clientes`
--

INSERT INTO `clientes` (`ClienteID`, `Nombre`, `Celular`, `Email`, `TipoIdentificacion`, `Identificacion`, `Direccion`) VALUES
(2, 'EDISON SEBASTIAN ', '0988515225', 'SEBAS@SEBAS', 'Cedula', '1805084280', 'CEVALLOS'),
(3, 'EDISON SEBASTIAN GAVILANES LOPEZ', '09885152252', 'SEBAS@SEBAS2', 'Cedula', '1805084281', 'AMBATO'),
(4, 'Cliente 1', '0987654321', 'cliente1@example.com', 'Cedula', '1234567890', 'Direccion 1'),
(5, 'Cliente 2', '0987654322', 'cliente2@example.com', 'RUC', '1234567891', 'Direccion 2'),
(6, 'Cliente 3', '0987654323', 'cliente3@example.com', 'Pasaporte', '1234567892', 'Direccion 3'),
(7, 'Cliente 4', '0987654324', 'cliente4@example.com', 'Cedula', '1234567893', 'Direccion 4'),
(8, 'Cliente 5', '0987654325', 'cliente5@example.com', 'RUC', '1234567894', 'Direccion 5'),
(9, 'Cliente 6', '0987654326', 'cliente6@example.com', 'Pasaporte', '1234567895', 'Direccion 6'),
(10, 'Cliente 7', '0987654327', 'cliente7@example.com', 'Cedula', '1234567896', 'Direccion 7'),
(11, 'Cliente 8', '0987654328', 'cliente8@example.com', 'RUC', '1234567897', 'Direccion 8'),
(12, 'GABRIEL NARANJO', '09999999', 'GABRIEL@GAGA', 'Cedula', '1850390129', 'CEVALLOS'),
(13, 'ADMIN', '345345', 'ADMIN@ADMIN.COM', 'Cedula', '123456789', 'DFSFSDS');

-- --------------------------------------------------------

--
-- Table structure for table `crearproducto`
--

DROP TABLE IF EXISTS `crearproducto`;
CREATE TABLE IF NOT EXISTS `crearproducto` (
  `codigo` varchar(50) NOT NULL,
  `ProveedorID` int DEFAULT NULL,
  `QueVende` varchar(255) DEFAULT NULL,
  `Color` varchar(50) DEFAULT NULL,
  `Detalle` text,
  `Material` enum('Cuero','Sintetico','Otro') DEFAULT NULL,
  `Categoria` enum('Botin','Bota','Casual','Deportivo') DEFAULT NULL,
  `Genero` enum('H','M') DEFAULT NULL,
  `Foto` varchar(255) DEFAULT NULL,
  `Estado` enum('activo','inactivo') DEFAULT NULL,
  PRIMARY KEY (`codigo`),
  KEY `ProveedorID` (`ProveedorID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `crearproducto`
--

INSERT INTO `crearproducto` (`codigo`, `ProveedorID`, `QueVende`, `Color`, `Detalle`, `Material`, `Categoria`, `Genero`, `Foto`, `Estado`) VALUES
('P001', 1, 'Botas', 'Negro', 'Bota de cuero para hombre', 'Cuero', 'Bota', 'H', NULL, 'activo'),
('P002', 2, 'Zapatos', 'Marrón', 'Zapato casual para mujer', 'Sintetico', 'Casual', 'M', NULL, 'activo'),
('P003', 3, 'Sandalias', 'Rojo', 'Sandalia cómoda para mujer', 'Otro', 'Casual', 'M', NULL, 'activo'),
('P004', 4, 'Botines', 'Gris', 'Botin de cuero para hombre', 'Cuero', 'Botin', 'H', NULL, NULL),
('P005', 5, 'Deportivos', 'Azul', 'Zapato deportivo para hombre', 'Sintetico', 'Deportivo', 'H', NULL, NULL),
('P006', 6, 'Casuales', 'Verde', 'Zapato casual para hombre', 'Sintetico', 'Casual', 'H', NULL, NULL),
('P007', 7, 'Botas y Botines', 'Negro', 'Botin de cuero para mujer', 'Cuero', 'Botin', 'M', NULL, NULL),
('P008', 8, 'Zapatillas', 'Blanco', 'Zapatilla deportiva para mujer', 'Sintetico', 'Deportivo', 'M', NULL, NULL),
('P009', 1, 'Botas', 'Negro', 'Bota de cuero para hombre', 'Cuero', 'Bota', 'H', NULL, NULL),
('P010', 2, 'Zapatos', 'Marrón', 'Zapato casual para mujer', 'Sintetico', 'Casual', 'M', NULL, NULL),
('P011', 3, 'Sandalias', 'Rojo', 'Sandalia cómoda para mujer', 'Otro', 'Casual', 'M', NULL, NULL),
('P012', 4, 'Botines', 'Gris', 'Botin de cuero para hombre', 'Cuero', 'Botin', 'H', NULL, NULL),
('P013', 5, 'Deportivos', 'Azul', 'Zapato deportivo para hombre', 'Sintetico', 'Deportivo', 'H', NULL, NULL),
('P014', 6, 'Casuales', 'Verde', 'Zapato casual para hombre', 'Sintetico', 'Casual', 'H', NULL, NULL),
('P015', 7, 'Botas y Botines', 'Negro', 'Botin de cuero para mujer', 'Cuero', 'Botin', 'M', NULL, NULL),
('P016', 8, 'Zapatillas', 'Blanco', 'Zapatilla deportiva para mujer', 'Sintetico', 'Deportivo', 'M', NULL, NULL),
('123', NULL, 'MASALUPI', 'NEGRO', 'MODA', 'Cuero', 'Botin', 'H', NULL, NULL),
('345', NULL, 'Botines', 'AZUL', 'BOTINES', 'Cuero', 'Bota', 'M', NULL, NULL),
('678', NULL, 'Casuales', 'NEGRO', 'CASUAL', 'Cuero', 'Casual', 'H', NULL, NULL),
('910', NULL, 'JANNINE', 'AZUL', 'DEPORTIVO ENZOTEC', 'Sintetico', 'Deportivo', 'H', '/imagenes/productos/910.jpg', 'inactivo'),
('2024', NULL, 'JANNINE', 'AZUL', 'TACO 1 1/2', 'Cuero', 'Botin', 'H', NULL, NULL),
('SAMBA', NULL, 'NIKE', 'NEGRO', 'DEPORTIVO', 'Cuero', 'Deportivo', 'H', NULL, NULL),
('911', NULL, 'Botas y Botines', 'NEGRO', 'BOTA EVILLA 21', 'Cuero', 'Bota', 'M', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `detalleventas`
--

DROP TABLE IF EXISTS `detalleventas`;
CREATE TABLE IF NOT EXISTS `detalleventas` (
  `DetalleVentaID` int NOT NULL AUTO_INCREMENT,
  `VentaID` int DEFAULT NULL,
  `ProductoID` int DEFAULT NULL,
  `Cantidad` int NOT NULL,
  `Precio` decimal(10,2) NOT NULL,
  `Descuento` decimal(10,2) DEFAULT '0.00',
  `Total` decimal(10,2) GENERATED ALWAYS AS (((`Precio` - `Descuento`) * `Cantidad`)) STORED,
  `Talla` int DEFAULT NULL,
  PRIMARY KEY (`DetalleVentaID`),
  KEY `VentaID` (`VentaID`),
  KEY `ProductoID` (`ProductoID`)
) ENGINE=MyISAM AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `detalleventas`
--

INSERT INTO `detalleventas` (`DetalleVentaID`, `VentaID`, `ProductoID`, `Cantidad`, `Precio`, `Descuento`, `Talla`) VALUES
(29, 35, 32, 1, 18.00, 0.00, 33),
(28, 33, 32, 1, 12.00, 0.00, 38),
(27, 32, 32, 1, 12.00, 0.00, 43),
(26, 31, 25, 1, 15.00, 0.00, 40),
(25, 29, 30, 1, 17.00, 0.00, 35),
(24, 28, 25, 1, 40.00, 0.00, 38),
(23, 27, 28, 1, 15.00, 0.00, 35),
(22, 26, 27, 1, 40.00, 0.00, 35),
(21, 25, 26, 1, 38.00, 0.00, 40),
(20, 25, 25, 1, 40.00, 0.00, 39),
(19, 24, 25, 1, 40.00, 0.00, 35),
(31, 41, 30, 1, 39.00, 0.00, 34);

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
CREATE TABLE IF NOT EXISTS `productos` (
  `ProductoID` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(255) NOT NULL,
  `IDFactura` int DEFAULT NULL,
  `Ubicacion` varchar(255) DEFAULT NULL,
  `PrecioCosto` decimal(10,2) NOT NULL,
  `PrecioVenta` decimal(10,2) GENERATED ALWAYS AS ((`PrecioCosto` * 1.15)) STORED,
  `InversionTotal` decimal(10,2) DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ProductoID`),
  KEY `codigo` (`codigo`(250))
) ENGINE=MyISAM AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`ProductoID`, `codigo`, `IDFactura`, `Ubicacion`, `PrecioCosto`, `InversionTotal`, `cantidad`, `fecha`) VALUES
(32, 'SAMBA', 505050, 'B1', 12.00, 138.00, 10, '2024-06-28 09:28:04'),
(31, '2024', 100100, 'A1', 25.00, 57.50, 2, '2024-06-28 08:08:34'),
(30, '910', 1001545545, 'Z1', 11.00, 75.90, 6, '2024-06-27 09:03:31'),
(29, '678', 454545, 'A1', 20.00, 253.00, 11, '2024-06-27 09:03:07'),
(28, '345', 100144, 'A1', 10.00, 126.50, 11, '2024-06-27 08:49:49'),
(27, '123', 1001556, 'Z1', 35.00, 442.75, 11, '2024-06-27 08:40:44'),
(26, 'M45', 100145, 'B1', 34.00, 430.10, 11, '2024-06-27 08:14:17'),
(25, 'R44', 10015656, 'A1', 34.00, 586.50, 15, '2024-06-27 08:08:04');

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
  `QueVende` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ProveedorID`)
) ENGINE=MyISAM AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `proveedores`
--

INSERT INTO `proveedores` (`ProveedorID`, `Nombre`, `Contacto`, `Telefono`, `Email`, `Direccion`, `QueVende`) VALUES
(4, 'CARLOS JUNIOR', 'JANNINE', '09999999', 'JANN@YOPMAIL.COM', 'AMBATO', 'NIKE'),
(5, 'JUAN CARLOS', 'MATCH', '099988888', 'MATCH@MATCH.COM', 'CUENCA', 'MATCH'),
(6, 'MASALUPI', 'MASALUPI', '0988515225', 'sebas1@yopmail.com', 'CUENCA', 'MASALUPI'),
(8, 'EJEMPLO', 'EJEMPLO', 'EJEMPLO', 'EJEMPLO@EJEMPLO', 'EJEMPLO', 'EJEMPLO'),
(9, 'Proveedor A', 'Contacto A', '1234567890', 'contactoA@proveedor.com', 'Direccion A', 'Botas'),
(10, 'Proveedor B', 'Contacto B', '2345678901', 'contactoB@proveedor.com', 'Direccion B', 'Zapatos'),
(11, 'Proveedor C', 'Contacto C', '3456789012', 'contactoC@proveedor.com', 'Direccion C', 'Sandalias'),
(12, 'Proveedor D', 'Contacto D', '4567890123', 'contactoD@proveedor.com', 'Direccion D', 'Botines'),
(13, 'Proveedor E', 'Contacto E', '5678901234', 'contactoE@proveedor.com', 'Direccion E', 'Deportivos'),
(14, 'Proveedor F', 'Contacto F', '6789012345', 'contactoF@proveedor.com', 'Direccion F', 'Casuales'),
(15, 'Proveedor G', 'Contacto G', '7890123456', 'contactoG@proveedor.com', 'Direccion G', 'Botas y Botines'),
(16, 'Proveedor H', 'Contacto H', '8901234567', 'contactoH@proveedor.com', 'Direccion H', 'Zapatillas'),
(17, 'Proveedor A', 'Contacto A', '1234567890', 'contactoA@proveedor.com', 'Direccion A', 'Botas'),
(18, 'Proveedor B', 'Contacto B', '2345678901', 'contactoB@proveedor.com', 'Direccion B', 'Zapatos'),
(19, 'Proveedor C', 'Contacto C', '3456789012', 'contactoC@proveedor.com', 'Direccion C', 'Sandalias'),
(20, 'Proveedor D', 'Contacto D', '4567890123', 'contactoD@proveedor.com', 'Direccion D', 'Botines'),
(21, 'Proveedor E', 'Contacto E', '5678901234', 'contactoE@proveedor.com', 'Direccion E', 'Deportivos'),
(22, 'Proveedor F', 'Contacto F', '6789012345', 'contactoF@proveedor.com', 'Direccion F', 'Casuales'),
(23, 'Proveedor G', 'Contacto G', '7890123456', 'contactoG@proveedor.com', 'Direccion G', 'Botas y Botines'),
(24, 'Proveedor H', 'Contacto H', '8901234567', 'contactoH@proveedor.com', 'Direccion H', 'Zapatillas'),
(25, 'Proveedor A', 'Contacto A', '1234567890', 'contactoA@proveedor.com', 'Direccion A', 'Botas'),
(26, 'Proveedor B', 'Contacto B', '2345678901', 'contactoB@proveedor.com', 'Direccion B', 'Zapatos'),
(27, 'Proveedor C', 'Contacto C', '3456789012', 'contactoC@proveedor.com', 'Direccion C', 'Sandalias'),
(28, 'Proveedor D', 'Contacto D', '4567890123', 'contactoD@proveedor.com', 'Direccion D', 'Botines'),
(29, 'Proveedor E', 'Contacto E', '5678901234', 'contactoE@proveedor.com', 'Direccion E', 'Deportivos'),
(30, 'Proveedor F', 'Contacto F', '6789012345', 'contactoF@proveedor.com', 'Direccion F', 'Casuales'),
(31, 'Proveedor G', 'Contacto G', '7890123456', 'contactoG@proveedor.com', 'Direccion G', 'Botas y Botines'),
(32, 'Proveedor H', 'Contacto H', '8901234567', 'contactoH@proveedor.com', 'Direccion H', 'Zapatillas'),
(33, 'Proveedor A', 'Contacto A', '1234567890', 'contactoA@proveedor.com', 'Direccion A', 'Botas'),
(35, 'Proveedor C', 'Contacto C', '3456789012', 'contactoC@proveedor.com', 'Direccion C', 'Sandalias'),
(36, 'Proveedor D', 'Contacto D', '4567890123', 'contactoD@proveedor.com', 'Direccion D', 'Botines'),
(37, 'Proveedor E', 'Contacto E', '5678901234', 'contactoE@proveedor.com', 'Direccion E', 'Deportivos'),
(38, 'Proveedor F', 'Contacto F', '6789012345', 'contactoF@proveedor.com', 'Direccion F', 'Casuales'),
(39, 'Proveedor G', 'Contacto G', '7890123456', 'contactoG@proveedor.com', 'Direccion G', 'Botas y Botines');

-- --------------------------------------------------------

--
-- Table structure for table `tallasproducto`
--

DROP TABLE IF EXISTS `tallasproducto`;
CREATE TABLE IF NOT EXISTS `tallasproducto` (
  `ProductoID` int NOT NULL,
  `Talla21` int DEFAULT '0',
  `Talla22` int DEFAULT '0',
  `Talla23` int DEFAULT '0',
  `Talla24` int DEFAULT '0',
  `Talla25` int DEFAULT '0',
  `Talla26` int DEFAULT '0',
  `Talla27` int DEFAULT '0',
  `Talla28` int DEFAULT '0',
  `Talla29` int DEFAULT '0',
  `Talla30` int DEFAULT '0',
  `Talla31` int DEFAULT '0',
  `Talla32` int DEFAULT '0',
  `Talla33` int DEFAULT '0',
  `Talla34` int DEFAULT '0',
  `Talla35` int DEFAULT '0',
  `Talla36` int DEFAULT '0',
  `Talla37` int DEFAULT '0',
  `Talla38` int DEFAULT '0',
  `Talla39` int DEFAULT '0',
  `Talla40` int DEFAULT '0',
  `Talla41` int DEFAULT '0',
  `Talla42` int DEFAULT '0',
  `Talla43` int DEFAULT '0',
  PRIMARY KEY (`ProductoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tallasproducto`
--

INSERT INTO `tallasproducto` (`ProductoID`, `Talla21`, `Talla22`, `Talla23`, `Talla24`, `Talla25`, `Talla26`, `Talla27`, `Talla28`, `Talla29`, `Talla30`, `Talla31`, `Talla32`, `Talla33`, `Talla34`, `Talla35`, `Talla36`, `Talla37`, `Talla38`, `Talla39`, `Talla40`, `Talla41`, `Talla42`, `Talla43`) VALUES
(8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2),
(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(4, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0),
(7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0),
(2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(101, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(102, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(103, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(104, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(105, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(106, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(107, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(108, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(25, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1),
(26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1),
(27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1),
(28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1),
(29, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0),
(31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0),
(32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `UsuarioID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Contraseña` varchar(100) NOT NULL,
  `Rol` enum('Administrador','Empleado') NOT NULL,
  PRIMARY KEY (`UsuarioID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`UsuarioID`, `Nombre`, `Email`, `Contraseña`, `Rol`) VALUES
(3, 'Desarrollador', 'DEV@DEV', '$2a$10$7ZFIz3tYkf4CrUcGR6HDKuyA92R0chirebvPqCK3jkMXCIW7tin0a', 'Empleado'),
(2, 'DEVELOPER', 'ROOT@ROOT.COM', '$2a$10$6NxZSIzLzjnS0hzKZPyr.eY.o59TotfIQImMKfMsCaVKizanBFyKO', 'Administrador'),
(10, 'root', 'root@gmail.com', '$2a$10$.Lnsvwwf0S3jPVxyqROcXOU14lV1Ulq9KjmS3f1ID3wduekRtacsS', 'Administrador'),
(7, 'ADMIN', 'ADMIN@ADMIN.COM', '$2a$10$6f2xBV3Ihfqc1dHVo3e3p.f4HL5B342EWvPbHDGXnTaUfByeisjIm', 'Administrador'),
(8, 'INVITADO', 'INVITADO@INVITADO.COM', '$2a$10$S3AriwaRa0Y9nDHxRN7h3.cBmxn.ZItpAUtfPL12p92S7rXFfa8j2', 'Empleado');

-- --------------------------------------------------------

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
CREATE TABLE IF NOT EXISTS `ventas` (
  `VentaID` int NOT NULL AUTO_INCREMENT,
  `ClienteID` int DEFAULT NULL,
  `Fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `FormaDePago` enum('Tarjeta de Credito','Tarjeta de Debito','Efectivo/Transferencia') NOT NULL,
  `SubtotalSinImpuestos` decimal(10,2) NOT NULL,
  `IVA15Porciento` decimal(10,2) GENERATED ALWAYS AS ((`SubtotalSinImpuestos` * 0.15)) STORED,
  `ValorTotal` decimal(10,2) GENERATED ALWAYS AS ((`SubtotalSinImpuestos` + `IVA15Porciento`)) STORED,
  PRIMARY KEY (`VentaID`),
  KEY `ClienteID` (`ClienteID`)
) ENGINE=MyISAM AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ventas`
--

INSERT INTO `ventas` (`VentaID`, `ClienteID`, `Fecha`, `FormaDePago`, `SubtotalSinImpuestos`) VALUES
(35, NULL, '2024-06-28 09:35:14', 'Tarjeta de Credito', 18.00),
(33, 2, '2024-06-28 09:31:55', 'Efectivo/Transferencia', 12.00),
(32, 2, '2024-06-28 09:31:35', 'Efectivo/Transferencia', 12.00),
(31, 3, '2024-06-27 10:01:34', 'Tarjeta de Credito', 15.00),
(30, 3, '2024-06-27 10:01:26', 'Tarjeta de Credito', 15.00),
(29, 3, '2024-06-27 09:43:12', 'Tarjeta de Debito', 17.00),
(28, 2, '2024-06-27 09:25:12', 'Tarjeta de Credito', 40.00),
(27, 2, '2024-06-27 08:50:29', 'Tarjeta de Debito', 15.00),
(26, 3, '2024-06-27 08:41:15', 'Tarjeta de Credito', 40.00),
(25, 2, '2024-06-27 08:15:41', 'Efectivo/Transferencia', 78.00),
(24, 4, '2024-06-27 08:12:11', 'Tarjeta de Debito', 40.00),
(38, NULL, '2025-04-20 03:45:05', 'Tarjeta de Credito', 78.00),
(39, 13, '2025-04-20 03:45:24', 'Efectivo/Transferencia', 78.00),
(40, 13, '2025-04-20 03:45:35', 'Efectivo/Transferencia', 39.00),
(41, 13, '2025-04-20 03:45:42', 'Efectivo/Transferencia', 39.00);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
