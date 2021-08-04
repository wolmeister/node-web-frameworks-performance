import Joi from 'joi';
import sql from 'sql-template-strings';
import Boom from '@hapi/boom';
import { compare } from 'bcryptjs';

import { dbPool } from '../db';
import { blacklistJwt, signJwt } from '../jwt';
import { User } from './user-api';

type AuthRequest = {
  email: string;
  password: string;
};

type AuthResponse = {
  token: string;
};

type RevokeTokenRequest = {
  token: string;
};

const authRequestSchema = Joi.object<AuthRequest>({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
}).required();

const revokeTokenRequestSchema = Joi.object<RevokeTokenRequest>({
  token: Joi.string().required(),
}).required();

/**
 * Creates a JWT token for the user.
 *
 * If the credentials are invalid, an exception will be thrown.
 * @param authRequest The user credentials
 * @returns The JWT token
 */
async function authenticate(authRequest: AuthRequest): Promise<AuthResponse> {
  const userResultSet = await dbPool.query<User>(sql`
    SELECT * from users
    WHERE email = ${authRequest.email}
  `);
  const user = userResultSet.rowCount === 1 ? userResultSet.rows[0] : null;

  if (!user) {
    throw Boom.badRequest('Invalid email');
  }

  if (await compare(authRequest.password, user.password)) {
    return {
      token: signJwt({ userId: user.id }),
    };
  }

  throw Boom.badRequest('Invalid password');
}

/**
 * Revokes the JWT token.
 *
 * If the token is invalid or already expired. nothing happens.
 * @param revokeTokenRequest The token to revoke
 */
async function revokeToken(revokeTokenRequest: RevokeTokenRequest) {
  await blacklistJwt(revokeTokenRequest.token);
}

export type { AuthRequest, AuthResponse, RevokeTokenRequest };
export { authRequestSchema, revokeTokenRequestSchema };
export const AuthApi = { authenticate, revokeToken };
