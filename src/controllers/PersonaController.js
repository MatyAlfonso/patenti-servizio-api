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

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const person = await Persona.findByPk(id);

        if (!person) return res.status(404).json({ error: "Persona non trovata" });

        await person.update(req.body);
        res.json(person);
    } catch (error) {
        res.status(400).json({ error: "Errore: Codice Fiscale già esistente o dati non validi." });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const person = await Persona.findByPk(id);
        if (!person) return res.status(404).json({ error: "Persona non trovata" });

        await person.destroy();
        res.json({ message: "Persona eliminata" });
    } catch (error) {
        res.status(400).json({ error: "Impossibile eliminare la persona." });
    }
};