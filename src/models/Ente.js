import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Ente = sequelize.define('Ente', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    descrizione: {
        type: DataTypes.STRING
    },
    sq_richieste: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    sq_patenti: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    codice_utente_responsabile: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'Enti'
});