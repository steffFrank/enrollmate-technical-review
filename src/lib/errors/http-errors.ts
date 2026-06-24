/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */

/** Structured HTTP error classes used by the action() helper and route handlers. */

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  readonly issues: string[];

  constructor({ message = "Invalid input.", issues = [] }: { message?: string; issues?: string[] } = {}) {
    super(message, 422, "VALIDATION_ERROR");
    this.issues = issues;
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database error occurred.") {
    super(message, 500, "DATABASE_ERROR");
  }
}

export class ServerError extends AppError {
  constructor(message = "An unexpected error occurred. Please try again.") {
    super(message, 500, "SERVER_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "The resource already exists.") {
    super(message, 409, "CONFLICT");
  }
}
