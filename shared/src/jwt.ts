import { sign, verify } from 'jsonwebtoken';
import Redis from 'ioredis';

export type JwtPayload = {
  userId: number;
};

const JWT_SECRET = '@node-web-frameworks-performance/JWT_SECRET';
const TOKEN_EXPIRATION = 30;

// @TODO: Add .env
const redis = new Redis({
  host: '192.168.0.3',
  port: 6379,
});

export function signJwt(payload: JwtPayload) {
  return sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION + 'm',
  });
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const payload = verify(token, JWT_SECRET) as JwtPayload;
  const isBlacklisted = await redis.get(token);

  if (isBlacklisted === 'true') {
    throw new Error('Token revoked');
  }

  return payload;
}

export async function blacklistJwt(token: string) {
  // Check if the token is valid
  try {
    verify(token, JWT_SECRET);
  } catch {
    return;
  }

  await redis.set(token, 'true', 'EX', (TOKEN_EXPIRATION + 1) * 60);
}
