import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const StatoRichiesta = sequelize.define('StatoRichiesta', {
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
    tableName: 'StatoRichieste'
});