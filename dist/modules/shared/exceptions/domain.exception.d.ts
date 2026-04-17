export declare class DomainException extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
export declare class NotFoundException extends DomainException {
    constructor(entity: string, identifier: string);
}
export declare class ConflictException extends DomainException {
    constructor(message: string);
}
export declare class UnauthorizedException extends DomainException {
    constructor(message?: string);
}
export declare class ForbiddenException extends DomainException {
    constructor(message?: string);
}
export declare class ValidationException extends DomainException {
    readonly field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare class BusinessRuleException extends DomainException {
    constructor(message: string);
}
