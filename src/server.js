import dotenv from 'dotenv';
import { httpServer } from './app.js';
import { sequelize } from './models/index.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully!');

        await sequelize.sync({ alter: true });
        console.log('Tables synchronized successfully!');

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
    }
};

startServer();