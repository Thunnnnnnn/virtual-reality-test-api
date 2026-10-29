import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const CODE_TO_STATUS: Record<string, number> = {
  P2025: HttpStatus.NOT_FOUND,
  P2002: HttpStatus.CONFLICT,
  P2003: HttpStatus.BAD_REQUEST,
};

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const status =
      exception instanceof Prisma.PrismaClientKnownRequestError
        ? (CODE_TO_STATUS[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR)
        : HttpStatus.BAD_REQUEST;
    const message = exception.message.split('\n').filter(Boolean).pop();
    host.switchToHttp().getResponse<Response>().status(status).json({ statusCode: status, message });
  }
}
