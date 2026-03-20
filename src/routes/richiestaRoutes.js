import { Router } from 'express';
import { getAll, create, update, generatePDF, remove } from '../controllers/RichiestaController.js';
import { issue } from '../controllers/PatenteServizioController.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.get('/', getAll);

router.get('/:id/pdf', generatePDF);

router.post('/', upload.fields([
    { name: 'fototessera', maxCount: 1 },
    { name: 'firma', maxCount: 1 }
]), create);

router.post('/:id', issue);

router.patch('/:id', upload.fields([
    { name: 'fototessera', maxCount: 1 },
    { name: 'firma', maxCount: 1 }
]), update);

router.delete('/:id', remove);

export default router;