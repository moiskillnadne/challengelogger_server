import jwt from 'jsonwebtoken';

import { BadRequestError } from '../errors';
import { logger } from '../logger';

interface GenerateTokenParams {
  payload: Record<string, unknown>;
  expiresIn: number;
  secret: string;
}

interface VerifyTokenParams {
  token: string;
  secret: string;
}

class JWTService {
  constructor() {}

  public generateToken(params: GenerateTokenParams): string {
    try {
      return jwt.sign(params.payload, params.secret, {
        expiresIn: params.expiresIn,
      });
    } catch (error: unknown) {
      logger.error(`[JWTService.generateToken] ${error}`);
      throw new BadRequestError(
        '[JWTService.generateToken] Can`t generate token',
      );
    }
  }

  public verifyToken(params: VerifyTokenParams) {
    try {
      return jwt.verify(params.token, params.secret);
    } catch (error: unknown) {
      logger.error(`[JWTService.verifyToken] ${error}`);
      throw new BadRequestError(
        '[JWTService.verifyToken] Invalid token. Can`t verify token',
      );
    }
  }
}

export const jwtService = new JWTService();
