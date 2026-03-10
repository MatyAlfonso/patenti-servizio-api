import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Persona = sequelize.define('Persona', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codice_fiscale: {
        type: DataTypes.STRING(16),
        unique: true,
        allowNull: false
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cognome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data_nascita: {
        type: DataTypes.DATEONLY
    },
    luogo_nascita: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'Persone'
});