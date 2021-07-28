import { DatabaseError } from 'pg';
import sql from 'sql-template-strings';
import Joi from 'joi';
import { hash } from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';

import { dbPool } from '../db';
import { HttpError } from '../http-error';

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type NewUser = {
  name: string;
  email: string;
  password: string;
};

const newUserSchema = Joi.object<NewUser>({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
}).required();

/**
 * Adds a new user.
 *
 * If the email has already been taken, an exception will be thrown.
 * @param user The user to add
 * @returns The new user
 */
async function addUser(user: NewUser): Promise<User> {
  try {
    const hashedPassword = await hash(user.password, 12);

    const result = await dbPool.query<User>(sql`
      INSERT INTO users (name, email, password)
      VALUES (${user.name}, ${user.email}, ${hashedPassword})
      RETURNING *
    `);
    return result.rows[0];
  } catch (err) {
    if (
      err instanceof DatabaseError &&
      err.constraint === 'users_email_unique'
    ) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Email has already been taken'
      );
    }
    throw err;
  }
}

export type { User, NewUser };
export { newUserSchema };
export const UserApi = { addUser };
