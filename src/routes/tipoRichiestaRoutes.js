import { Router } from 'express';
import { getAll } from '../controllers/TipoRichiestaController.js';

const router = Router();

router.get('/', getAll);

export default router;