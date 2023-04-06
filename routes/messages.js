import { Router } from 'express';

import MessagesController from '../controllers/MessagesController';

const router = Router();

router.post(
  '/send',
  MessagesController.send,
);
router.get(
  '/list/:friendId',
  MessagesController.list,
);
router.post(
  '/open',
  MessagesController.open,
);
export default router;
