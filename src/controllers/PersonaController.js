import { Persona } from '../models/index.js';

export const getAll = async (req, res) => {
    try {
        const people = await Persona.findAll();
        res.json(people);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const newPerson = await Persona.create(req.body);
        res.status(201).json(newPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};