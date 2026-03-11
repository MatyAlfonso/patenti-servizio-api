import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

import personaRoutes from './routes/personaRoutes.js';
import enteRoutes from './routes/enteRoutes.js';
import richiestaRoutes from './routes/richiestaRoutes.js';
import patenteCivileRoutes from './routes/patenteCivileRoutes.js';
//import categoriaPatenteRoutes from './routes/categoriaPatenteRoutes.js';
//import tipoRichiestaRoutes from './routes/tipoRichiestaRoutes.js';

export const app = express();
export const httpServer = createServer(app);

// Middlewares
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/persone', personaRoutes);
app.use('/enti', enteRoutes)
app.use('/richieste', richiestaRoutes);
app.use('/patenti-civili', patenteCivileRoutes);
//app.use('/categorie-patenti', categoriaPatenteRoutes);
//app.use('/tipi-richieste', tipoRichiestaRoutes);