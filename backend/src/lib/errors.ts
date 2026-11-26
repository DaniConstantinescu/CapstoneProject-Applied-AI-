export interface ErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetail[];

  constructor(statusCode: number, code: string, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid request data', details?: ErrorDetail[]) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication is required to access this resource') {
    super(401, 'UNAUTHENTICATED', message);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid email or password') {
    super(401, 'INVALID_CREDENTIALS', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'The requested resource was not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class EmailTakenError extends AppError {
  constructor(message: string = 'An account with this email already exists') {
    super(409, 'EMAIL_TAKEN', message);
  }
}

export class CartEmptyError extends AppError {
  constructor(message: string = 'Cannot checkout with an empty shopping cart') {
    super(409, 'CART_EMPTY', message);
  }
}

export class CancellationNotAllowedError extends AppError {
  constructor(
    message: string = 'Order cancellation window (48 hours) has expired or order is already cancelled'
  ) {
    super(409, 'CANCELLATION_NOT_ALLOWED', message);
  }
}
