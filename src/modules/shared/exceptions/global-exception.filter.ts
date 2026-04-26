import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import {
  DomainException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  ValidationException,
  BusinessRuleException,
} from './domain.exception';

interface ErrorResponse {
  success: false;
  data: null;
  error: string;
  code: string;
  field?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, body } = this.resolve(exception, request);

    // Log server-side errors with full detail (never exposed to client)
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${status}: ${body.error}`,
      );
    }

    response.status(status).json(body);
  }

  private resolve(
    exception: unknown,
    _request: Request,
  ): { status: number; body: ErrorResponse } {
    // ── Domain exceptions (our own, always safe to show) ──────────────────
    if (exception instanceof NotFoundException) {
      return this.build(
        HttpStatus.NOT_FOUND,
        exception.message,
        exception.code,
      );
    }

    if (exception instanceof ConflictException) {
      return this.build(HttpStatus.CONFLICT, exception.message, exception.code);
    }

    if (exception instanceof UnauthorizedException) {
      return this.build(
        HttpStatus.UNAUTHORIZED,
        exception.message,
        exception.code,
      );
    }

    if (exception instanceof ForbiddenException) {
      return this.build(
        HttpStatus.FORBIDDEN,
        exception.message,
        exception.code,
      );
    }

    if (exception instanceof ValidationException) {
      return this.build(
        HttpStatus.UNPROCESSABLE_ENTITY,
        exception.message,
        exception.code,
        exception.field,
      );
    }

    if (exception instanceof BusinessRuleException) {
      return this.build(
        HttpStatus.UNPROCESSABLE_ENTITY,
        exception.message,
        exception.code,
      );
    }

    if (exception instanceof DomainException) {
      return this.build(
        HttpStatus.BAD_REQUEST,
        exception.message,
        exception.code,
      );
    }

    // ── MikroORM / PostgreSQL errors (translate, never expose SQL) ─────────
    if (exception instanceof UniqueConstraintViolationException) {
      const field = this.extractUniqueField(exception.message);
      return this.build(
        HttpStatus.CONFLICT,
        field
          ? `Ya existe un registro con ese ${field}`
          : 'Ya existe un registro con esos datos',
        'DUPLICATE_ENTRY',
      );
    }

    // ── NestJS HTTP exceptions (from guards, pipes, etc.) ─────────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message ??
            exception.message);

      // class-validator validation errors come as array
      const readable = Array.isArray(message) ? message[0] : message;
      return this.build(status, readable, 'VALIDATION_ERROR');
    }

    // ── Unexpected errors (never leak internals) ───────────────────────────
    return this.build(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Ocurrió un error inesperado. Por favor intente nuevamente.',
      'INTERNAL_ERROR',
    );
  }

  private build(
    status: number,
    error: string,
    code: string,
    field?: string,
  ): { status: number; body: ErrorResponse } {
    return {
      status,
      body: {
        success: false,
        data: null,
        error,
        code,
        ...(field ? { field } : {}),
      },
    };
  }

  /**
   * Attempt to extract the column name from a unique constraint message.
   * e.g. 'Key (email)=(x@x.com) already exists' → 'email'
   */
  private extractUniqueField(message: string): string | null {
    const match = /Key \((\w+)\)/.exec(message);
    return match ? match[1] : null;
  }
}
