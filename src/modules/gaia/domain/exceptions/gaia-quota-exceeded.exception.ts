import { HttpException, HttpStatus } from '@nestjs/common';

const QUOTA_EXCEEDED_MESSAGE =
  'Has alcanzado tu límite diario de interacciones con GaIA. Actualiza tu plan para continuar.';

export class GaiaQuotaExceededException extends HttpException {
  constructor() {
    super(
      { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: QUOTA_EXCEEDED_MESSAGE },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
