import jwt from 'jsonwebtoken';

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
    return jwt.sign(payload, this.secret, {
      expiresIn,
    });
  }

  public verifyToken(token: string) {
    return jwt.verify(token, this.secret);
  }
}

export const jwtService = new JWTService();
