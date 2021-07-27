import { DatabaseError } from 'pg';
import sql from 'sql-template-strings';
import { hash } from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';

import { CreateUser, User } from '../schemas/user-schema';
import { dbPool } from '../db';
import { HttpError } from '../http-error';

export async function addUser(user: CreateUser): Promise<User> {
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
