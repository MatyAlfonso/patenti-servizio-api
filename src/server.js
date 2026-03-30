import dotenv from 'dotenv';
import cron from 'node-cron';
import { httpServer } from './app.js';
import { sequelize } from './models/index.js';
import { checkExpiredLicenses } from './utils/checkExpiredLicenses.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully!');

        //await sequelize.sync({ alter: true });
        await sequelize.sync();

        console.log('Tables synchronized successfully!');

        console.log('Initial check for expired licenses...');
        await checkExpiredLicenses();

        cron.schedule('1 0 * * *', async () => {
            console.log('Cron Job: Verifying expired licenses...');
            await checkExpiredLicenses();
        });

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
    }
};

startServer();