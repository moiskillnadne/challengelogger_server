interface ErrorParams {
  message: string;
  statusCode: number;
  type: string; // Example: ENTITY_NOT_FOUND
  specificType?: string; // Example: USER_NOT_FOUND
}

export class AppBaseError extends Error {
  public isOperational: boolean;
  public statusCode: number;
  public type: string;
  public specificType?: string;

  constructor(params: ErrorParams) {
    super(params.message);
    this.isOperational = true;
    this.statusCode = params.statusCode;
    this.type = params.type;
    this.specificType = params.specificType;

    Error.captureStackTrace(this, this.constructor);
  }
}
