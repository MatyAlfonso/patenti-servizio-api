import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

import personaRoutes from './routes/personaRoutes.js';
import enteRoutes from './routes/enteRoutes.js';

export const app = express();
export const httpServer = createServer(app);

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/persone', personaRoutes);
app.use('/enti', enteRoutes)