declare namespace Express {
  export interface Request {
    traceId?: string;
    user?: {
      id: string;
      createdAt: string;
      updatedAt: string;
      email: string;
    };
  }
}
