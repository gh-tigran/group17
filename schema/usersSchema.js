import Joi from 'joi';

export default {
  register: {
    body: {
      firstName: Joi.string().pattern(/^[a-zA-Z]+$/).trim().required(),
      lastName: Joi.string().pattern(/^[a-zA-Z]+$/).trim().required(),
      email: Joi.string().email().required(),
      password: Joi.string().trim().min(5),
      cityId: Joi.number().integer().positive(),
    },
  },
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required(),
    },
  },
};
