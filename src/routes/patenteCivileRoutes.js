import { Router } from 'express';
import { getAll, create, update } from '../controllers/PatenteCivileController.js';

const router = Router();

router.get('/', getAll);
router.post('/', create);
router.patch('/:id', update);

export default router;