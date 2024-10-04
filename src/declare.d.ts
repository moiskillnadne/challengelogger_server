declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      createdAt: string;
      updatedAt: string;
    };
  }
}
