export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}

export class NotFoundException extends DomainException {
  constructor(entity: string, identifier: string) {
    super(`${entity} no encontrado: ${identifier}`, 'NOT_FOUND');
  }
}

export class ConflictException extends DomainException {
  constructor(message: string) {
    super(message, 'CONFLICT');
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message = 'No autorizado') {
    super(message, 'UNAUTHORIZED');
  }
}

export class ForbiddenException extends DomainException {
  constructor(message = 'No tiene permiso para realizar esta acción') {
    super(message, 'FORBIDDEN');
  }
}

export class ValidationException extends DomainException {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class BusinessRuleException extends DomainException {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION');
  }
}
