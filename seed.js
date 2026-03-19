import { sequelize, CategoriaPatente, StatoPatente, StatoRichiesta, TipoRichiesta } from './src/models/index.js';

const seed = async () => {
    try {
        await sequelize.sync();

        const categories = [
            { id: 'I', descrizione: 'Patente B' },
            { id: 'I IV', descrizione: 'Patente BE' },
            { id: 'II', descrizione: 'Patente C' },
            { id: 'II IV', descrizione: 'Patente CE' },
            { id: 'III', descrizione: 'Patente D' },
            { id: 'III IV', descrizione: 'Patente DE' },
        ];
        await CategoriaPatente.bulkCreate(categories, { ignoreDuplicates: true });

        const licensesStates = [
            { id: 'ANNULLATA', descrizione: 'Annullata' },
            { id: 'ATTIVA', descrizione: 'Attiva' },
            { id: 'IN_PREPARAZIONE', descrizione: 'In preparazione' },
            { id: 'REVOCATA', descrizione: 'Revocata' },
            { id: 'SCADUTA', descrizione: 'Scaduta' },
            { id: 'RUBATA', descrizione: 'Rubata' },
            { id: 'SMARRITA', descrizione: 'Smarrita' },
            { id: 'SOSPESA', descrizione: 'Sospesa' }
        ];
        await StatoPatente.bulkCreate(licensesStates, { ignoreDuplicates: true });

        const requestsStates = [
            { id: 'IN_PREPARAZIONE', descrizione: 'In preparazione' },
            { id: 'INVIATA', descrizione: 'Inviata' },
            { id: 'RESPINTA', descrizione: 'Respinta' }
        ];
        await StatoRichiesta.bulkCreate(requestsStates, { ignoreDuplicates: true });

        const requestsTypes = [
            { id: 'NUOVA', descrizione: 'Rilascio nuova patente' },
            { id: 'RINNOVO', descrizione: 'Rinnovo per scadenza' },
        ];
        await TipoRichiesta.bulkCreate(requestsTypes, { ignoreDuplicates: true });

        console.log("Tables seeded successfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding tables:", error);
        process.exit(1);
    }
};

seed();