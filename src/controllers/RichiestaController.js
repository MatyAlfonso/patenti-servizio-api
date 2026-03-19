import { Richiesta, Persona, Ente, StatoRichiesta, TipoRichiesta, Allegato, PatenteCivile, PatenteServizio, sequelize } from '../models/index.js';
import { generateLicenseBuffer } from '../services/pdfGenerator.js';

export const getAll = async (req, res) => {
    try {
        const requests = await Richiesta.findAll({
            include: [
                { model: Persona, as: 'persona', include: [{ model: PatenteCivile, as: 'patente_civile' }] },
                { model: Ente, as: 'ente' },
                { model: StatoRichiesta, as: 'stato' },
                { model: TipoRichiesta, as: 'tipo' },
                { model: Allegato, as: 'fototessera' },
                { model: Allegato, as: 'firma_scansionata' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            id_persona, id_ente, id_tipo, id_stato, residenza_persona, note_richiedente,
            patente_civile_numero, patente_civile_categorie, patente_civile_autorita, patente_civile_rilascio, patente_civile_scadenza
        } = req.body;

        const ente = await Ente.findByPk(id_ente, { transaction });
        if (!ente) throw new Error("Ente non trovato");
        const newSq = (ente.sq_richieste || 0) + 1;
        await ente.update({ sq_richieste: newSq }, { transaction });

        const [patente, created] = await PatenteCivile.findOrCreate({
            where: { id_persona: id_persona },
            defaults: {
                numero: patente_civile_numero,
                data_rilascio: patente_civile_rilascio,
                data_scadenza: patente_civile_scadenza,
                id_categoria: patente_civile_categorie,
                id_stato: 'ATTIVA',
                autorita: patente_civile_autorita
            },
            transaction
        });

        if (!created) {
            await patente.update({
                numero: patente_civile_numero,
                data_rilascio: patente_civile_rilascio,
                data_scadenza: patente_civile_scadenza,
                id_categoria: patente_civile_categorie,
                autorita: patente_civile_autorita
            }, { transaction });
        }

        let id_foto = null;
        let id_firma = null;

        if (req.files?.fototessera) {
            const foto = await Allegato.create({
                nome_file: req.files.fototessera[0].originalname,
                path: req.files.fototessera[0].path,
                data_inserimento: new Date()
            }, { transaction });
            id_foto = foto.id;
        }

        if (req.files?.firma) {
            const firma = await Allegato.create({
                nome_file: req.files.firma[0].originalname,
                path: req.files.firma[0].path,
                data_inserimento: new Date()
            }, { transaction });
            id_firma = firma.id;
        }

        const newRequest = await Richiesta.create({
            data_richiesta: new Date(),
            id_persona,
            id_ente,
            id_tipo,
            id_stato,
            residenza_persona,
            note_richiedente,
            id_foto,
            id_firma,
            numero_richiesta_ente: newSq
        }, { transaction });

        await transaction.commit();
        res.status(201).json(newRequest);
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_stato } = req.body;

        const richiesta = await Richiesta.findByPk(id);

        if (!richiesta) {
            return res.status(404).json({ error: "Richiesta non trovata" });
        }

        if (richiesta.id_stato !== 'IN_PREPARAZIONE' && id_stato === 'RESPINTA') {
            return res.status(400).json({ error: "Non è possibile respingere una richiesta già elaborata" });
        }

        await richiesta.update({ id_stato });

        const updatedRequest = await Richiesta.findByPk(id, {
            include: [
                { model: StatoRichiesta, as: 'stato' }
            ]
        });

        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const generatePDF = async (req, res) => {
    try {
        const { id } = req.params;
        const richiesta = await Richiesta.findByPk(id);
        
        if (!richiesta) return res.status(404).json({ error: "Richiesta non trovata" });

        const patente = await PatenteServizio.findOne({
            where: { 
                id_persona: richiesta.id_persona,
                id_ente: richiesta.id_ente,
                id_stato: 'ATTIVA'
            },
            include: [
                { 
                    model: Persona, 
                    as: 'persona', 
                    include: [{ model: PatenteCivile, as: 'patente_civile' }] 
                },
                { model: Allegato, as: 'fototessera' }, 
                { model: Allegato, as: 'firma_scansionata' }
            ]
        });

        if (!patente) return res.status(404).json({ error: "Patente non emessa per questa richiesta" });

        const buffer = await generateLicenseBuffer(patente);

        res.setHeader('Content-Type', 'application/pdf');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};