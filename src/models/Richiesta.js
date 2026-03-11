import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Richiesta = sequelize.define('Richiesta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    data_richiesta: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    residenza_persona: {
        type: DataTypes.STRING
    },
    note_richiedente: {
        type: DataTypes.TEXT
    },
    note_ufficio: {
        type: DataTypes.TEXT
    },
    codice_utente_responsabile: {
        type: DataTypes.STRING
    },
    numero_richiesta_ente: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Richieste'
});