import jwt from 'jsonwebtoken';
import HttpError from 'http-errors';

const { JWT_SECRET } = process.env;

const EXCLUDE = [
  'POST:/users/login',
  'POST:/users/register',
  'GET:/users/activate',
  'GET:/countries',
];

export default function authorization(req, res, next) {
  try {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    if (EXCLUDE.includes(`${req.method}:${req.path}`)) {
      next();
      return;
    }
    const token = req.headers.authorization || req.query.token || '';
    const data = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);

    if (!data.userId) {
      throw HttpError(401);
    }
    req.userId = data.userId;
    next();
  } catch (e) {
    e.status = 401;
    next(e);
  }
}
