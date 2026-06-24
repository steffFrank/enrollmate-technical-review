/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import {
  AppError,
  DatabaseError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "./http-errors";

export type ErrorPayload = {
  message: string;
  code: string;
  statusCode: number;
  issues?: string[];
};

/** Normalizes any thrown value into a serializable ErrorPayload for action results. */
export function handleError(error: unknown): ErrorPayload {
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      issues: error.issues,
    };
  }

  if (
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof DatabaseError ||
    error instanceof NotFoundError ||
    error instanceof ServerError ||
    error instanceof AppError
  ) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Unknown error — never leak internals.
  const fallback = new ServerError();
  return {
    message: fallback.message,
    code: fallback.code,
    statusCode: fallback.statusCode,
  };
}
