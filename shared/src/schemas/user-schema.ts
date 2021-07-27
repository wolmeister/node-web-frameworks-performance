import Joi from 'joi';

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export type CreateUser = {
  name: string;
  email: string;
  password: string;
};

export const createUserSchema = Joi.object<CreateUser>({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
}).required();
