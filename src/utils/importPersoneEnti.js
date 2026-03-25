import * as Models from '../models/index.js';
import { importExcelToModel } from '../services/excelImporter.js';
import { globalNormalizer } from './formatters.js';
import * as Mappings from './mapping.js';

const { sequelize, Persona, Ente } = Models;

const importConfigs = [
    {
        name: 'Persone',
        model: Persona,
        mapping: Mappings.mappingAnagrafica,
        file: '../../data/Persone.xlsx'
    },
    {
        name: 'Enti',
        model: Ente,
        mapping: Mappings.mappingEnti,
        file: '../../data/Enti.xlsx'
    },
];

const runAll = async () => {
    try {
        console.log('--- Import all ---');
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        for (const config of importConfigs) {
            console.log(`\nProcessing: ${config.name}...`);

            const res = await importExcelToModel(
                config.file,
                config.model,
                config.mapping,
                globalNormalizer
            );

            console.log(`Success: ${res.success}`);
            if (res.errors.length > 0) {
                console.warn(`Error: ${res.errors.length}`);
                console.log(res.errors.slice(0, 5));
            }
        }

        console.log('\nImport finished with success!');
    } catch (error) {
        console.error("\nError::", error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

runAll();