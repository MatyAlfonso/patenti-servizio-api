import express from "express";
import { createServer } from "http";
import cors from "cors";

export const app = express();
export const httpServer = createServer(app);

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
