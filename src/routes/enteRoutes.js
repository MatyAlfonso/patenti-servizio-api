import { Router } from 'express';
import { getAll, create } from '../controllers/EnteController.js';

const router = Router();

router.get('/', getAll);
router.post('/', create);

export default router;