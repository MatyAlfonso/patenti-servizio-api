import {
    PatenteCivile,
    PatenteServizio,
    StatoPatente,
    CategoriaPatente,
    sequelize
} from '../models/index.js';
import ExcelJS from 'exceljs';
import { globalNormalizer } from '../utils/formatters.js';

const MAP_CAT = { "1": "I", "3": "II", "5": "III", "2": "I_IV", "4": "II_IV", "6": "III_IV" };
const MAP_STATO_PAT = { "0": "IN_PREPARAZIONE", "1": "ATTIVA", "3": "ANNULLATA", "4": "REVOCATA", "5": "SCADUTA", "6": "RUBATA", "7": "SMARRITA", "8": "REVOCATA" };

const run = async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('../../data/Patenti.xlsx');
    const worksheet = workbook.getWorksheet(1);

    try {
        await sequelize.authenticate();
        await sequelize.sync();

        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            if (!row.getCell(1).value) continue;

            const parseDate = (val) => {
                if (!val) return null;
                const d = new Date(val);
                if (isNaN(d.getTime()) || d.getFullYear() < 1900) return null;
                return d;
            };

            const clean = (val, attr) => globalNormalizer(val, attr);

            const catId = MAP_CAT[row.getCell('Q').value] || clean(row.getCell('Q').value);
            const statoId = MAP_STATO_PAT[row.getCell('S').value] || clean(row.getCell('S').value);

            const raw = {
                id: row.getCell('A').value, // ID_PATENTE
                p_civ_num: row.getCell('J').value, // PATENTE_CIVILE_NUMERO
                p_civ_ril: parseDate(row.getCell('H').value), // PATENTE_CIVILE_DATA_RILASCIO
                p_civ_aut: row.getCell('G').value, // PATENTE_CIVILE_AUTORITA
                p_civ_sca: parseDate(row.getCell('I').value), // PATENTE_CIVILE_DATA_SCADENZA
                p_ser_num: row.getCell('F').value, // NUMERO_PATENTE_DI_SERVIZIO
                p_ser_ril: parseDate(row.getCell('C').value), // DATA_RILASCIO
                p_ser_not: row.getCell('E').value, // NOTE_UFFICIO
                //cat_id: row.getCell('Q').value,    // COD_PATENTE_CATEGORIA
                cat_desc: row.getCell('R').value,  // PATENTE_CATEGORIA
                //stato_id: row.getCell('S').value,  // COD_PATENTE_STATO
                stato_desc: row.getCell('T').value,// PATENTE_STATO
                id_persona: row.getCell('O').value,// ID_INTESTATARIO_ANA
                id_ente: row.getCell('L').value    // ID_ENTE
            };
            try {
                await sequelize.transaction(async (t) => {
                    await StatoPatente.findOrCreate({
                        where: { id: statoId },
                        defaults: { descrizione: clean(raw.stato_desc) },
                        transaction: t
                    });

                    await CategoriaPatente.findOrCreate({
                        where: { id: catId },
                        defaults: { descrizione: clean(raw.cat_desc) },
                        transaction: t
                    });

                    await PatenteCivile.upsert({
                        id: raw.id,
                        numero: clean(raw.p_civ_num),
                        data_rilascio: raw.p_civ_ril,
                        autorita: clean(raw.p_civ_aut),
                        data_scadenza: raw.p_civ_sca,
                        id_persona: raw.id_persona,
                        id_categoria: catId,
                        id_stato: statoId
                    }, { transaction: t });

                    await PatenteServizio.upsert({
                        id: raw.id,
                        numero: clean(raw.p_ser_num),
                        data_rilascio: raw.p_ser_ril,
                        note_ufficio: clean(raw.p_ser_not),
                        id_persona: raw.id_persona,
                        id_ente: raw.id_ente,
                        id_categoria: catId,
                        id_stato: statoId,
                        id_patentecivile: raw.id
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