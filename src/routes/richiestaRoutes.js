import { Router } from 'express';
import { getAll, create, update } from '../controllers/RichiestaController.js';
import { issue } from '../controllers/PatenteServizioController.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.get('/', getAll);

router.post('/', upload.fields([
    { name: 'fototessera', maxCount: 1 },
    { name: 'firma', maxCount: 1 }
]), create);

router.post('/:id', issue);

router.patch('/:id', update);

export default router;