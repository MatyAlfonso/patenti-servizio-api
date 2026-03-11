import { PatenteCivile, Persona, CategoriaPatente, StatoPatente } from '../models/index.js';

export const getAll = async (req, res) => {
    try {
        const licenses = await PatenteCivile.findAll({
            include: [
                {
                    model: Persona,
                    attributes: ['nome', 'cognome']
                },
                {
                    model: CategoriaPatente,
                    attributes: ['id', 'descrizione']
                },
                {
                    model: StatoPatente,
                    attributes: ['id', 'descrizione']
                }
            ],
            order: [['data_scadenza', 'ASC']]
        });
        res.json(licenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const newLicense = await PatenteCivile.create(req.body);
        res.status(201).json(newLicense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};