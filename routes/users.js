import { Router } from 'express';

import UsersController from '../controllers/UsersController';
import upload from '../middlewares/upload';
import validate from '../middlewares/validate';
import usersSchema from '../schema/usersSchema';

const router = Router();

router.post(
  '/login',
  validate(usersSchema.login),
  UsersController.login,
);

router.post(
  '/register',
  upload(['image/png', 'image/jpeg', 'image/gif']).single('avatar'),
  validate(usersSchema.register),
  UsersController.register,
);

router.get('/', UsersController.usersList);

router.get('/single/:userId', UsersController.profile);
router.get('/profile', UsersController.profile);
router.get('/profile/cv', UsersController.downloadCv);
router.get('/activate', UsersController.activate);

router.delete('/profile', UsersController.deleteProfile);

router.put('/profile', UsersController.updateProfile);
router.get('/download', UsersController.download);

router.post(
  '/upload',
  upload(['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']).single('file'),
  UsersController.upload,
);

export default router;
