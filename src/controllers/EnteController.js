import { Ente } from '../models/index.js';

export const getAll = async (req, res) => {
    try {
        const entities = await Ente.findAll();
        res.json(entities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const dataToCreate = {
            ...req.body,
            sq_richieste: 0,
            sq_patenti: 0
        };

        const newEntity = await Ente.create(dataToCreate);
        res.status(201).json(newEntity);
    } catch (error) {
        res.status(400).json({ error: "Il codice ente esiste già o i dati non sono validi." });
    }
};