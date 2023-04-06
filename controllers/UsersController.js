import jwt from 'jsonwebtoken';
import HttpError from 'http-errors';
import XLSX from 'xlsx';
import os from 'os';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Sequelize } from 'sequelize';
import pdfConverter from '../services/pdfConverter';
import Mail from '../services/Mail';
import { Messages, Users } from '../models';

const { JWT_SECRET, API_URL } = process.env;

class UsersController {
  static login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({
        where: {
          email,
          password: Users.passwordHash(password),
        },
      });
      if (!user) {
        throw HttpError(401, 'invalid email or password');
      }

      if (user.status !== 'active') {
        throw HttpError(401, 'User is not active');
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {});

      res.json({
        status: 'ok',
        token,
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static register = async (req, res, next) => {
    try {
      const { file } = req;
      const {
        firstName, lastName, email, password, cityId,
      } = req.body;

      const existingUser = await Users.findOne({
        where: { email },
      });
      if (existingUser) {
        throw HttpError(422, { errors: { email: 'Email already exists' } });
      }
      let avatar;
      if (file) {
        avatar = path.join('/images/avatar', `${uuidv4()}-${file.originalname}`);
        fs.renameSync(file.path, path.resolve(path.join('./public', avatar)));
      }

      const user = await Users.create({
        firstName, lastName, email, password, cityId, avatar,
      });

      const activationToken = jwt.sign({ email, id: user.id }, JWT_SECRET);

      user.activationToken = activationToken;
      await user.save();

      const activationUrl = `${API_URL}?activationToken=${activationToken}`;
      if (user) {
        await Mail.send(email, 'Activate', 'user_exists', {
          activationUrl,
          email,
        });
      }
      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static usersList = async (req, res, next) => {
    try {
      const { userId } = req;
      const { page = 1, s } = req.query;
      const limit = 20;

      const where = {};
      if (s) {
        where.$or = [
          { firstName: { $like: `%${s}%` } },
          { lastName: { $like: `%${s}%` } },
          { email: { $like: `%${s}%` } },
        ];
      }

      const lastMessage = await Messages.findAll({
        where: {
          $or: [
            { from: userId },
            { to: userId },
          ],
        },
        attributes: [
          [Sequelize.literal(`IF(\`from\` <> ${userId}, \`from\`, \`to\`  )`), 'friendId'],
          [Sequelize.literal(`IF(\`from\` = ${userId}, \`from\`, \`to\`  )`), 'userId'],
        ],
        raw: true,
        order: [Sequelize.literal('MAX(createdAt)')],
        group: ['userId', 'friendId'],
      });

      let users = await Users.findAll({
        where,
        limit,
        include: [{
          model: Messages,
          as: 'messagesFrom',
          limit: 1,
          where: {
            to: userId,
          },
          required: false,
        }, {
          model: Messages,
          as: 'messagesTo',
          limit: 1,
          where: {
            from: userId,
          },
          required: false,
        }],
        subQuery: false,
        offset: (page - 1) * limit,
        group: ['users.id'],
      });

      users = users.map((user) => {
        const fromId = user.messagesFrom[0]?.id || 0;
        const toId = user.messagesTo[0]?.id || 0;
        const message = toId > fromId ? user.messagesTo[0] : user.messagesFrom[0];
        user.setDataValue('lastMessage', message);
        user.setDataValue('messagesFrom', undefined);
        user.setDataValue('messagesTo', undefined);
        return user;
      });
      users = _.orderBy(users, (u) => lastMessage.findIndex((d) => +d.friendId === +u.id), 'desc');

      // await Promise.delay(_.random(1000, 4000));
      res.json({
        status: 'ok',
        lastMessage,
        users,
        userId,
      });
    } catch (e) {
      next(e);
    }
  };

  static activate = async (req, res, next) => {
    try {
      const { activationToken } = req.query;
      let data = {};
      try {
        data = jwt.verify(activationToken, JWT_SECRET);
      } catch (e) {
        data = {};
      }
      console.log(data);
      if (!data.email) {
        throw HttpError(404);
      }
      const user = await Users.findOne({
        email: data.email,
      });

      if (!user) {
        throw HttpError(404);
      }
      user.status = 'active';

      await user.save();

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {});

      res.json({
        status: 'ok',
        user,
        token,
      });
    } catch (e) {
      next(e);
    }
  };

  static profile = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.userId;

      const user = await Users.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw HttpError(404);
      }
      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static updateProfile = async (req, res, next) => {
    try {
      const { userId } = req;
      const user = Users.get(userId);

      if (!user) {
        throw HttpError(404, 'User not found');
      }

      const { firstName, lastName, countryId } = req.body;

      await Users.update(userId, {
        firstName, lastName, countryId,
      });

      res.json({
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteProfile = async (req, res, next) => {
    try {
      const { userId } = req;
      const user = await Users.get(userId);

      if (!user) {
        throw HttpError(404, 'User not found');
      }

      await Users.delete(userId);

      res.json({
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };

  static download = async (req, res, next) => {
    try {
      const users = await Users.findAll({
        raw: true,
      });

      const wb = XLSX.utils.book_new();

      const sheet = XLSX.utils.json_to_sheet(users);

      XLSX.utils.book_append_sheet(wb, sheet, 'Users');

      const filePath = path.join(os.tmpdir(), `${uuidv4()}.xlsx`);

      XLSX.writeFile(wb, filePath, {
        bookType: 'xlsx',
      });
      res.sendFile(filePath, () => {
        fs.unlinkSync(filePath);
      });

      // const buffer = XLSX.write(wb, {
      //   type: "buffer",
      //   bookType: "xlsx"
      // });
      // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('users.xlsx');
      res.format('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      // res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
      // res.send(buffer);
    } catch (e) {
      next(e);
    }
  };

  static upload = async (req, res, next) => {
    try {
      const { file } = req;
      const wb = XLSX.readFile(file.path);

      const sheet = Object.values(wb.Sheets)[0];
      const data = XLSX.utils.sheet_to_json(sheet);

      const errors = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const datum of data) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const [, isCreate] = await Users.findOrCreate({
            defaults: {
              ...datum,
              id: undefined,
            },
            where: {
              email: datum.email,
            },
          });
          if (!isCreate) {
            // eslint-disable-next-line no-await-in-loop
            await Users.update({
              ...datum,
              id: undefined,
            }, {
              where: {
                email: datum.email,
              },
            });
          }
        } catch (e) {
          errors[datum.email] = e.message;
        }
      }

      res.json({
        status: 'ok',
        errors,
      });
    } catch (e) {
      next(e);
    }
  };

  static downloadCv = async (req, res, next) => {
    try {
      const buffer = await pdfConverter(`
<h2 id="data">Hello</h2>
<div style="background-color: yellow">Hello</div>
`);
      res.setHeader('Content-type', 'image/pdf');
      res.send(buffer);
    } catch (e) {
      next(e);
    }
  };
}

export default UsersController;
