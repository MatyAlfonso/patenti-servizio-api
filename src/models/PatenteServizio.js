import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const PatenteServizio = sequelize.define('PatenteServizio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.STRING,
        unique: true
    },
    data_rilascio: {
        type: DataTypes.DATEONLY
    },
    note_ufficio: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'PatentiServizio'
});