import { HttpException, HttpStatus } from '@nestjs/common';

export class GaiaTtsForbiddenException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'La voz premium requiere un plan Pro o ProMax.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
