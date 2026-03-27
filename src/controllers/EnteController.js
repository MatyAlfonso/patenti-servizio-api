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
            id: req.body.id.toUpperCase(),
            descrizione: req.body.descrizione.toUpperCase(),
            sq_richieste: 0,
            sq_patenti: 0
        };

        const newEntity = await Ente.create(dataToCreate);
        res.status(201).json(newEntity);
    } catch (error) {
        res.status(400).json({ error: "Il codice ente esiste già o i dati non sono validi." });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { descrizione } = req.body;

        const entity = await Ente.findByPk(id);
        if (!entity) {
            return res.status(404).json({ error: "Ente non trovato" });
        }

        await entity.update({ descrizione });
        res.json(entity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const entity = await Ente.findByPk(id);

        if (!entity) {
            return res.status(404).json({ error: "Ente non trovato" });
        }

        await entity.destroy();
        res.json({ message: "Ente eliminato correctamente" });
    } catch (error) {
        res.status(400).json({
            error: "Impossibile eliminare l'ente: esitono richieste o patenti associate."
        });
    }
};