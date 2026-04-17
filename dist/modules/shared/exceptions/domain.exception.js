"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleException = exports.ValidationException = exports.ForbiddenException = exports.UnauthorizedException = exports.ConflictException = exports.NotFoundException = exports.DomainException = void 0;
class DomainException extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'DomainException';
    }
}
exports.DomainException = DomainException;
class NotFoundException extends DomainException {
    constructor(entity, identifier) {
        super(`${entity} no encontrado: ${identifier}`, 'NOT_FOUND');
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends DomainException {
    constructor(message) {
        super(message, 'CONFLICT');
    }
}
exports.ConflictException = ConflictException;
class UnauthorizedException extends DomainException {
    constructor(message = 'No autorizado') {
        super(message, 'UNAUTHORIZED');
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends DomainException {
    constructor(message = 'No tiene permiso para realizar esta acción') {
        super(message, 'FORBIDDEN');
    }
}
exports.ForbiddenException = ForbiddenException;
class ValidationException extends DomainException {
    field;
    constructor(message, field) {
        super(message, 'VALIDATION_ERROR');
        this.field = field;
    }
}
exports.ValidationException = ValidationException;
class BusinessRuleException extends DomainException {
    constructor(message) {
        super(message, 'BUSINESS_RULE_VIOLATION');
    }
}
exports.BusinessRuleException = BusinessRuleException;
//# sourceMappingURL=domain.exception.js.map