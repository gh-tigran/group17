import HttpError from 'http-errors';
import { Messages } from '../models/index';
import Socket from '../services/Socket';

class MainController {
  static send = async (req, res, next) => {
    try {
      const { userId } = req;
      const {
        key, friendId, message: messageText, type = 'text',
      } = req.body;

      console.log(key);
      const message = await Messages.create({
        to: friendId,
        from: userId,
        message: messageText,
        type,
        seen: null,
      });

      Socket.emitUser(friendId, 'new-message', { message });

      res.json({
        status: 'ok',
        message,
      });
    } catch (e) {
      next(e);
    }
  };

  static list = async (req, res, next) => {
    try {
      const { userId } = req;
      const { friendId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      console.log(friendId, userId);
      const messages = await Messages.findAll({
        where: {
          $or: [
            { from: userId, to: friendId },
            { from: friendId, to: userId },
          ],
        },
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'desc']],
      });

      res.json({
        status: 'ok',
        messages,
      });
    } catch (e) {
      next(e);
    }
  };

  static open = async (req, res, next) => {
    try {
      const { userId } = req;
      const { messageId } = req.body;

      const message = await Messages.findOne({
        where: {
          id: messageId,
          seen: { $is: null },
          $or: [
            { from: userId },
            { to: userId },
          ],
        },
      });

      if (!message) {
        throw HttpError(404);
      }

      const friendId = +message.from === +userId ? message.to : message.from;

      message.seen = new Date();
      await message.save();

      Socket.emitUser(friendId, 'open-message', {
        messageId,
        userId,
      });

      res.json({
        status: 'ok',
        message,
      });
    } catch (e) {
      next(e);
    }
  };
  static test = async (req, res, next) => {
    try {
      const { userId } = req;
      const { messageId } = req.body;

      const message = await Messages.findOne({
        where: {
          id: messageId,
          seen: { $is: null },
          $or: [
            { from: userId },
            { to: userId },
          ],
        },
      });

      if (!message) {
        throw HttpError(404);
      }

      const friendId = +message.from === +userId ? message.to : message.from;

      message.seen = new Date();
      await message.save();

      Socket.emitUser(friendId, 'open-message', {
        messageId,
        userId,
      });

      res.json({
        status: 'ok',
        message,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default MainController;
