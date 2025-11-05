const { Sequelize, DataTypes } = require('sequelize');
const db = require('../db/db.js');

const Productos = db.define('Productos', {
    ProductoID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    IDFactura: {
        type: DataTypes.INTEGER,
    },
    Ubicacion: {
        type: DataTypes.STRING,
    },
    PrecioCosto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    PrecioVenta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    InversionTotal: {
        type: DataTypes.DECIMAL(10, 2),
    },
    cantidad: {
        type: DataTypes.INTEGER,
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: false,
});

module.exports = Productos;
