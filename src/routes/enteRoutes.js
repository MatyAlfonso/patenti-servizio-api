import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/EnteController.js';

const router = Router();

router.get('/', getAll);
router.post('/', create);
router.patch('/:id', update)
router.delete('/:id', remove)

export default router;