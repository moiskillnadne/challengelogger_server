import jwt from 'jsonwebtoken';

import { BadRequestError } from '../errors';
import { logger } from '../logger';

class JWTService {
  private secret: string;

  constructor() {
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('The JWT_SECRET_KEY variable not provided');
    }

    this.secret = process.env.JWT_SECRET_KEY;
  }

  public generateToken(
    payload: Record<string, unknown>,
    expiresIn: number,
  ): string {
    try {
      return jwt.sign(payload, this.secret, {
        expiresIn: 86400000,
      });
    } catch (error: unknown) {
      logger.error(`[JWTService.generateToken] ${error}`);
      throw new BadRequestError(
        '[JWTService.generateToken] Can`t generate token',
      );
    }
  }

  public verifyToken(token: string) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error: unknown) {
      logger.error(`[JWTService.verifyToken] ${error}`);
      throw new BadRequestError(
        '[JWTService.verifyToken] Invalid token. Can`t verify token',
      );
    }
  }
}

export const jwtService = new JWTService();
