import { Router } from 'express';
import { getAll, create } from '../controllers/RichiestaController.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.get('/', getAll);

router.post('/', upload.fields([
    { name: 'fototessera', maxCount: 1 },
    { name: 'firma', maxCount: 1 }
]), create);

export default router;