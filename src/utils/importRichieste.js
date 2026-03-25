import {
    Richiesta,
    TipoRichiesta,
    StatoRichiesta,
    Persona,
    sequelize
} from '../models/index.js';
import ExcelJS from 'exceljs';
import { globalNormalizer } from '../utils/formatters.js';

const run = async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('../../data/Richieste.xlsx');
    const worksheet = workbook.getWorksheet(1);

    try {
        await sequelize.authenticate();
        await sequelize.sync();

        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);

            const idRequest = row.getCell('A').value;
            const idType = row.getCell('H').value;
            const descType = row.getCell('I').value;

            if (!idRequest || (!idType && !descType)) {
                continue;
            }

            if (!row.getCell(1).value) continue;

            const parseDate = (val) => {
                if (!val) return null;
                const d = new Date(val);
                if (isNaN(d.getTime()) || d.getFullYear() < 1900) return null;
                return d;
            };

            const clean = (val) => globalNormalizer(val);

            const raw = {
                id: row.getCell('A').value,
                cf: clean(row.getCell('B').value),
                data_richiesta: parseDate(row.getCell('G').value),
                tipo_id: clean(row.getCell('X').value),
                tipo_desc: clean(row.getCell('Y').value),
                note_req: clean(row.getCell('J').value),
                note_off: clean(row.getCell('K').value),
                num_rich_ente: row.getCell('M').value,
                cod_resp: clean(row.getCell('O').value),
                id_ente: row.getCell('P').value,
                id_patente_civile: row.getCell('T').value,
                stato_id: clean(row.getCell('AA').value),
                stato_desc: clean(row.getCell('AB').value)
            };

            try {
                await sequelize.transaction(async (t) => {
                    await TipoRichiesta.findOrCreate({
                        where: { id: raw.tipo_id },
                        defaults: { descrizione: raw.tipo_desc },
                        transaction: t
                    });

                    await StatoRichiesta.findOrCreate({
                        where: { id: raw.stato_id },
                        defaults: { descrizione: raw.stato_desc },
                        transaction: t
                    });

                    const persona = await Persona.findOne({
                        where: { codice_fiscale: raw.cf },
                        transaction: t
                    });

                    await Richiesta.upsert({
                        id: raw.id,
                        data_richiesta: raw.data_richiesta,
                        note_richiedente: raw.note_req,
                        note_ufficio: raw.note_off,
                        codice_utente_responsabile: raw.cod_resp,
                        numero_richiesta_ente: raw.num_rich_ente || 0,
                        id_persona: persona ? persona.id : null,
                        id_ente: raw.id_ente,
                        id_tipo: raw.tipo_id,
                        id_stato: raw.stato_id,
                        id_patentecivile: raw.id_patente_civile
                    }, { transaction: t });
                });
            } catch (error) {
                console.error(`Error in row ${i} (ID: ${row.getCell(1).value}):`, error.message);
            }
        }
        console.log("Import finished with success.");
    } catch (error) {
        console.error("Error:", error);

    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

run();