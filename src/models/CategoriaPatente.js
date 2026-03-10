import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const CategoriaPatente = sequelize.define('CategoriaPatente', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    descrizione: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'CategoriaPatenti'
});