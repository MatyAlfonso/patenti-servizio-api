import { PatenteCivile, Persona, CategoriaPatente, StatoPatente, PatenteServizio, sequelize } from '../models/index.js';

export const getAll = async (req, res) => {
    try {
        const licenses = await PatenteCivile.findAll({
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
            order: [['data_scadenza', 'ASC']]
        });
        res.json(licenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_persona, numero, id_categoria, autorita, data_rilascio, data_scadenza } = req.body;

        const existingActive = await PatenteCivile.findOne({
            where: { id_persona, id_stato: 'ATTIVA' },
            transaction
        });

        if (existingActive) {
            await transaction.rollback();
            return res.status(400).json({
                error: "Questa persona ha già una patente civile attiva nel sistema."
            });
        }

        const newLicense = await PatenteCivile.create({
            id_persona,
            numero: numero.toUpperCase(),
            id_categoria,
            autorita: autorita.toUpperCase(),
            data_rilascio,
            data_scadenza,
            id_stato: 'ATTIVA'
        }, { transaction });

        await transaction.commit();

        const fullLicense = await PatenteCivile.findByPk(newLicense.id, {
            include: ['persona', 'categoria', 'stato']
        });

        res.status(201).json(fullLicense);
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

        const patenteCivile = await PatenteCivile.findByPk(id);
        if (!patenteCivile) throw new Error("Patente civile non trovata");

        await patenteCivile.update({ id_stato }, { transaction });

        if (id_stato !== 'ATTIVA') {
            await PatenteServizio.update(
                {
                    id_stato,
                    note: `Inabilitata automaticamente: patente civile in stato ${id_stato}`
                },
                {
                    where: { id_persona: patenteCivile.id_persona, id_stato: 'ATTIVA' },
                    transaction
                }
            );
        }

        await transaction.commit();
        res.json({ message: "Stato aggiornato e dipendenze verificate" });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};