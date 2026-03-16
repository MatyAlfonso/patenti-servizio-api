import { PatenteServizio, Persona, CategoriaPatente, StatoPatente, Richiesta, Ente, sequelize } from '../models/index.js';

export const getAll = async (req, res) => {
    try {
        const licenses = await PatenteServizio.findAll({
            include: [
                {
                    model: Persona,
                    as: 'persona'
                },
                {
                    model: CategoriaPatente,
                    as: 'categoria'
                },
                {
                    model: StatoPatente,
                    as: 'stato'
                }
            ],
            order: [['data_rilascio', 'DESC']]
        });
        res.json(licenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const issue = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const request = await Richiesta.findByPk(id, { transaction });
        if (!request) throw new Error("Richiesta non trovata");
        if (request.id_stato === 'INVIATA') throw new Error("Richiesta già processata");

        const entity = await Ente.findByPk(request.id_ente, { transaction });
        const newSq = (entity.sq_patenti || 0) + 1;

        const newLicense = await PatenteServizio.create({
            id_persona: request.id_persona,
            id_ente: request.id_ente,
            id_categoria: request.id_categoria_richiesta,
            id_stato: 'ATTIVA',
            id_foto: request.id_foto,
            id_firma: request.id_firma,
            id_patentecivile: request.id_patentecivile,
            data_rilascio: new Date(),
            data_scadenza: request.patente_civile_scadenza
        }, { transaction });

        await entity.update({ sq_patenti: newSq }, { transaction });
        await request.update({ id_stato: 'INVIATA' }, { transaction });

        await transaction.commit();
        res.status(201).json(newLicense);
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};

export const update = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { id_stato } = req.body;

        const patente = await PatenteServizio.findByPk(id);
        if (!patente) throw new Error("Patente di servizio non trovata");

        await patente.update({
            id_stato,
        }, { transaction });

        await transaction.commit();
        res.json({ message: `Stato aggiornato a ${id_stato} con successo`, patente });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};