import fs from 'fs';
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

        const existingRequest = await Richiesta.findOne({
            where: {
                id_persona,
                id_stato: ['IN_PREPARAZIONE']
            },
            transaction
        });

        if (existingRequest) {
            await transaction.rollback();
            return res.status(400).json({
                error: "Esiste già una richiesta in corso per questa persona."
            });
        }

        const currentActiveLicense = await PatenteCivile.findOne({
            where: { id_persona, id_stato: 'ATTIVA' },
            transaction
        });

        if (id_tipo === 'NUOVA') {
            if (currentActiveLicense) {
                await transaction.rollback();
                return res.status(400).json({ error: "La persona ha già una patente attiva. Usa 'Rinnovo'." });
            }
        } else if (id_tipo === 'RINNOVO') {
            if (currentActiveLicense) {
                await currentActiveLicense.update({ id_stato: 'SCADUTA' }, { transaction });
            }
        }

        await PatenteCivile.create({
            id_persona,
            numero: patente_civile_numero.toUpperCase(),
            data_rilascio: patente_civile_rilascio,
            data_scadenza: patente_civile_scadenza,
            id_categoria: patente_civile_categorie,
            id_stato: 'ATTIVA',
            autorita: patente_civile_autorita.toUpperCase()
        }, { transaction });

        const entity = await Ente.findByPk(id_ente, { transaction });
        if (!entity) throw new Error("Ente non trovato");

        const newSequence = (entity.sq_richieste || 0) + 1;
        await entity.update({ sq_richieste: newSequence }, { transaction });

        let photoId = null;
        let signatureId = null;

        if (req.files?.fototessera) {
            const photo = await Allegato.create({
                nome_file: req.files.fototessera[0].originalname,
                path: req.files.fototessera[0].path,
                data_inserimento: new Date()
            }, { transaction });
            photoId = photo.id;
        }

        if (req.files?.firma) {
            const signature = await Allegato.create({
                nome_file: req.files.firma[0].originalname,
                path: req.files.firma[0].path,
                data_inserimento: new Date()
            }, { transaction });
            signatureId = signature.id;
        }

        const newRequest = await Richiesta.create({
            data_richiesta: new Date(),
            id_persona,
            id_ente,
            id_tipo,
            id_stato,
            residenza_persona: residenza_persona.toUpperCase(),
            note_richiedente,
            id_foto: photoId,
            id_firma: signatureId,
            numero_richiesta_ente: newSequence
        }, { transaction });

        await transaction.commit();
        res.status(201).json(newRequest);
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};

export const update = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const data = req.body;

        const request = await Richiesta.findByPk(id, {
            include: ['fototessera', 'firma_scansionata'],
            transaction
        });

        if (!request) {
            await transaction.rollback();
            return res.status(404).json({ error: "Richiesta non trovata" });
        }

        await request.update({
            id_ente: data.id_ente || request.id_ente,
            id_tipo: data.id_tipo || request.id_tipo,
            id_stato: data.id_stato || request.id_stato,
            residenza_persona: data.residenza_persona ? data.residenza_persona.toUpperCase() : request.residenza_persona,
            note_richiedente: data.note_richiedente || request.note_richiedente
        }, { transaction });

        if (req.files?.fototessera) {
            const file = req.files.fototessera[0];
            const newPhoto = await Allegato.create({
                nome_file: file.originalname,
                path: file.path,
                data_inserimento: new Date()
            }, { transaction });
            await request.update({ id_foto: newPhoto.id }, { transaction });
        }

        if (req.files?.firma) {
            const file = req.files.firma[0];
            const newSignature = await Allegato.create({
                nome_file: file.originalname,
                path: file.path,
                data_inserimento: new Date()
            }, { transaction });
            await request.update({ id_firma: newSignature.id }, { transaction });
        }

        if (data.patente_civile_numero) {
            const civilLicense = await PatenteCivile.findOne({
                where: {
                    id_persona: request.id_persona,
                    id_stato: 'ATTIVA'
                },
                transaction
            });

            if (civilLicense) {
                await civilLicense.update({
                    numero: data.patente_civile_numero.toUpperCase(),
                    id_categoria: data.patente_civile_categorie || civilLicense.id_categoria,
                    autorita: data.patente_civile_autorita ? data.patente_civile_autorita.toUpperCase() : civilLicense.autorita,
                    data_rilascio: data.patente_civile_rilascio || civilLicense.data_rilascio,
                    data_scadenza: data.patente_civile_scadenza || civilLicense.data_scadenza
                }, { transaction });
            }
        }

        await transaction.commit();
        res.json({ message: "Richiesta aggiornata correttamente" });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error in update:", error);
        res.status(500).json({ error: error.message });
    }
};

export const generatePDF = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Richiesta.findByPk(id);

        if (!request) return res.status(404).json({ error: "Richiesta non trovata" });

        const serviceLicense = await PatenteServizio.findOne({
            where: {
                id_persona: request.id_persona,
                id_ente: request.id_ente,
                id_foto: request.id_foto,
                id_firma: request.id_firma,
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

        if (!serviceLicense) return res.status(404).json({ error: "Patente non emessa per questa richiesta" });

        const buffer = await generateLicenseBuffer(serviceLicense);

        res.setHeader('Content-Type', 'application/pdf');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const remove = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const request = await Richiesta.findByPk(id, { transaction });
        if (!request) {
            await transaction.rollback();
            return res.status(404).json({ error: "Richiesta non trovata" });
        }

        const issuedLicense = await PatenteServizio.findOne({
            where: { id_persona: request.id_persona, id_ente: request.id_ente, id_stato: 'ATTIVA' },
            transaction
        });

        if (issuedLicense) {
            await transaction.rollback();
            return res.status(400).json({ error: "Non si può eliminare: una patente di servizio è già stata emessa." });
        }

        await request.destroy({ transaction });

        await transaction.commit();
        res.json({ message: "Richiesta eliminata correttamente" });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
};