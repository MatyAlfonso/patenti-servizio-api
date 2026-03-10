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
        const newEntity = await Ente.create(req.body);
        res.status(201).json(newEntity);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};