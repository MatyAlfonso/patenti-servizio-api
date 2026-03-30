import { PatenteCivile, PatenteServizio, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

export const checkExpiredLicenses = async () => {
    const transaction = await sequelize.transaction();
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiredCivili = await PatenteCivile.findAll({
            where: {
                id_stato: 'ATTIVA',
                data_scadenza: { [Op.lt]: today }
            },
            transaction
        });

        if (expiredCivili.length === 0) {
            await transaction.commit();
            return { updatedCivili: 0, updatedServizio: 0 };
        }

        const personIds = expiredCivili.map(p => p.id_persona);

        const [updatedCiviliCount] = await PatenteCivile.update(
            { id_stato: 'SCADUTA' },
            {
                where: { id: expiredCivili.map(p => p.id) },
                transaction
            }
        );

        const [updatedServizioCount] = await PatenteServizio.update(
            {
                id_stato: 'SCADUTA',
            },
            {
                where: {
                    id_persona: personIds,
                    id_stato: 'ATTIVA'
                },
                transaction
            }
        );

        await transaction.commit();

        return { updatedCivili: updatedCiviliCount, updatedServizio: updatedServizioCount };

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error:", error);
        throw error;
    }
};