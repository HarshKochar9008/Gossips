import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  private getMessageFromException(exception: unknown): string {
    if (typeof exception === 'string') return exception;
    if (exception instanceof Error) {
      if (exception.message !== '[object Object]') {
        const cause = (exception as Error & { cause?: unknown }).cause;
        const causeMsg = cause instanceof Error ? cause.message : null;
        if (causeMsg && causeMsg !== '[object Object]') return causeMsg;
        return exception.message;
      }
      const cause = (exception as Error & { cause?: unknown }).cause;
      if (cause instanceof Error && cause.message !== '[object Object]') return cause.message;
      const o = exception as unknown as Record<string, unknown>;
      if (typeof o.message === 'string') return o.message;
      if (o.meta && typeof o.meta === 'object' && typeof (o.meta as Record<string, unknown>).message === 'string') {
        return (o.meta as { message: string }).message;
      }
    }
    const o = exception as unknown as Record<string, unknown>;
    if (o && typeof o === 'object' && typeof o.message === 'string') return o.message;
    return 'Internal server error';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (response.headersSent) return;

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    if (isHttpException) {
      const res = exception.getResponse();
      const msg = typeof res === 'string' ? res : (res as { message?: string | string[] }).message;
      message = Array.isArray(msg) ? msg[0] ?? 'Error' : (msg ?? exception.message);
    } else {
      const err = exception instanceof Error ? exception : new Error(String(exception));
      message = this.getMessageFromException(exception);
      this.logger.error(`Unhandled exception: ${message}`, err.stack);
    }

    const body: Record<string, unknown> = { message };
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error && exception.stack) {
      body.stack = exception.stack;
    }

    response.status(status).json(body);
  }
}
