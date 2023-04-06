import Joi from 'joi';
import HttpError from 'http-errors';

const validate = (obj) => (req, res, next) => {
  try {
    const schema = Joi.object(obj).unknown();
    const { error } = schema.validate(req, { abortEarly: false });
    if (error) {
      const errors = error.details.reduce((acc, cur) => {
        acc[cur.context.key] = cur.message
          .replace('"body.', '"')
          .replace('"query.', '"')
          .replace('"params.', '"');
        return acc;
      }, {});

      throw HttpError(422, { errors });
    }
    console.log(2222);
    next();
  } catch (e) {
    next(e);
  }
};

export default validate;
