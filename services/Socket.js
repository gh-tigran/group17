import { Server as IoServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Users } from '../models';

const { JWT_SECRET } = process.env;

class Socket {
  static init(server) {
    this.io = new IoServer(server, {
      cors: '*',
    });

    this.io.on('connect', this.#onConnect);
  }

  static #onConnect = async (client) => {
    try {
      const { authorization } = client.handshake.headers;

      const { userId, isAdmin } = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET);

      if (!userId) {
        return;
      }
      const user = await Users.findOne({
        where: {
          id: userId,
        },
      });
      if (isAdmin) {
        client.join('admin');
      }
      client.join(`user_${userId}`);
      client.on('send-typing', (data) => {
        const { friendId } = data;
        this.io.to(`user_${friendId}`).emit('typing', {
          userId,
        });
      });

      user.isOnline = true;
      user.save().catch(console.error);

      this.io.emit('user-online', { userId, isOnline: true });

      client.on('disconnect', async () => {
        if (!this.io.sockets.adapter.rooms.get(`user_${userId}`)?.size) {
          const lastActive = new Date();
          this.io.emit('user-online', { userId, isOnline: false, lastActive });

          user.isOnline = false;
          user.lastActive = lastActive;
          await user.save();
        }
      });
    } catch (e) {
      //
    }
  };

  static emit = (to, event, data = {}) => this.io.to(to).emit(event, data);

  static emitUser = (userId, event, data = {}) => this.emit(`user_${userId}`, event, data);
}

export default Socket;
