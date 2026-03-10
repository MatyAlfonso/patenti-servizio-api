import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const PatenteCivile = sequelize.define('PatenteCivile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data_rilascio: {
        type: DataTypes.DATEONLY
    },
    autorita: {
        type: DataTypes.STRING
    },
    data_scadenza: {
        type: DataTypes.DATEONLY
    }
}, {
    tableName: 'PatentiCivili'
});