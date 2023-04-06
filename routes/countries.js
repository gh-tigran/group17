import { Router } from 'express';

import Countries from '../controllers/CountriesController';

const router = Router();

router.get('/', Countries.list);

export default router;
