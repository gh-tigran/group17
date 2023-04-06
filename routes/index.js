import { Router } from 'express';
import users from './users';
import countries from './countries';
import MainController from '../controllers/MainController';
import messages from './messages';

const router = Router();

router.get('/', MainController.main);

router.use('/users', users);
router.use('/countries', countries);
router.use('/messages', messages);

export default router;
