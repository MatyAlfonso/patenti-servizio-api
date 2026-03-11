import { Router } from 'express';
import { getAll } from '../controllers/CategoriaPatenteController.js';

const router = Router();

router.get('/', getAll);

export default router;