import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Allegato = sequelize.define('Allegato', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome_file: {
        type: DataTypes.STRING
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data_inserimento: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Allegati'
});