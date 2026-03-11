import { CategoriaPatente } from '../models/index.js';

export const getAll = async (req, res) => {
    try {
        const categories = await CategoriaPatente.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
