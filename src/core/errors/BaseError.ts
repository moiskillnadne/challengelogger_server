interface ErrorParams {
  message: string;
  statusCode: number;
  type: string; // Example: ENTITY_NOT_FOUND
}

export class BaseError extends Error {
  public isOperational: boolean;
  public statusCode: number;
  public type: string;

  constructor(params: ErrorParams) {
    super(params.message);
    this.isOperational = true;
    this.statusCode = params.statusCode;
    this.type = params.type;

    Error.captureStackTrace(this, this.constructor);
  }
}
