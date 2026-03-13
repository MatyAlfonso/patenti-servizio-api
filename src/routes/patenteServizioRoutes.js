import { Router } from 'express';
import { getAll, update } from '../controllers/PatenteServizioController.js';

const router = Router();

router.get('/', getAll);
router.patch('/:id', update);

export default router;