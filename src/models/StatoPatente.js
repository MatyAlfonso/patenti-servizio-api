import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const StatoPatente = sequelize.define('StatoPatente', {
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
    tableName: 'StatoPatenti'
});