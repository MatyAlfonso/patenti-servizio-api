import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../database.sqlite'), 
    logging: false,
    define: {
        freezeTableName: false,
    }
});