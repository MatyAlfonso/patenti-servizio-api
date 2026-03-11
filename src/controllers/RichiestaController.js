import { Richiesta, Persona, Ente, StatoRichiesta, TipoRichiesta, Allegato, sequelize } from '../models/index.js';

export const getAll = async (req, res) => {
    try {
        const richieste = await Richiesta.findAll({
            include: [
                { model: Persona, attributes: ['nome', 'cognome'] },
                { model: Ente, attributes: ['descrizione'] },
                { model: StatoRichiesta },
                { model: TipoRichiesta },
                { model: Allegato, as: 'Fototessera' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(richieste);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_persona, id_ente, id_tipo, id_stato, residenza_persona, note_richiedente } = req.body;

        let id_foto = null;
        let id_firma = null;

        if (req.files.fototessera) {
            const foto = await Allegato.create({
                nome_file: req.files.fototessera[0].originalname,
                path: req.files.fototessera[0].path,
                data_inserimento: new Date()
            }, { transaction });
            id_foto = foto.id;
        }

        if (req.files.firma) {
            const firma = await Allegato.create({
                nome_file: req.files.firma[0].originalname,
                path: req.files.firma[0].path,
                data_inserimento: new Date()
            }, { transaction });
            id_firma = firma.id;
        }

        const nuevaRichiesta = await Richiesta.create({
            data_richiesta: new Date(),
            id_persona,
            id_ente,
            id_tipo,
            id_stato,
            residenza_persona,
            note_richiedente,
            id_foto,
            id_firma
        }, { transaction });

        await transaction.commit();
        res.status(201).json(nuevaRichiesta);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};