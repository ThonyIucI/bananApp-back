"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@mikro-orm/core");
const domain_exception_1 = require("./domain.exception");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const { status, body } = this.resolve(exception, request);
        if (status >= 500) {
            this.logger.error(`[${request.method}] ${request.url} → ${status}`, exception instanceof Error ? exception.stack : String(exception));
        }
        else {
            this.logger.warn(`[${request.method}] ${request.url} → ${status}: ${body.error}`);
        }
        response.status(status).json(body);
    }
    resolve(exception, _request) {
        if (exception instanceof domain_exception_1.NotFoundException) {
            return this.build(common_1.HttpStatus.NOT_FOUND, exception.message, exception.code);
        }
        if (exception instanceof domain_exception_1.ConflictException) {
            return this.build(common_1.HttpStatus.CONFLICT, exception.message, exception.code);
        }
        if (exception instanceof domain_exception_1.UnauthorizedException) {
            return this.build(common_1.HttpStatus.UNAUTHORIZED, exception.message, exception.code);
        }
        if (exception instanceof domain_exception_1.ForbiddenException) {
            return this.build(common_1.HttpStatus.FORBIDDEN, exception.message, exception.code);
        }
        if (exception instanceof domain_exception_1.ValidationException) {
            return this.build(common_1.HttpStatus.UNPROCESSABLE_ENTITY, exception.message, exception.code, exception.field);
        }
        if (exception instanceof domain_exception_1.BusinessRuleException) {
            return this.build(common_1.HttpStatus.UNPROCESSABLE_ENTITY, exception.message, exception.code);
        }
        if (exception instanceof domain_exception_1.DomainException) {
            return this.build(common_1.HttpStatus.BAD_REQUEST, exception.message, exception.code);
        }
        if (exception instanceof core_1.UniqueConstraintViolationException) {
            const field = this.extractUniqueField(exception.message);
            return this.build(common_1.HttpStatus.CONFLICT, field
                ? `Ya existe un registro con ese ${field}`
                : 'Ya existe un registro con esos datos', 'DUPLICATE_ENTRY');
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const res = exception.getResponse();
            const message = typeof res === 'string'
                ? res
                : res.message ?? exception.message;
            const readable = Array.isArray(message) ? message[0] : message;
            return this.build(status, readable, 'VALIDATION_ERROR');
        }
        return this.build(common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'Ocurrió un error inesperado. Por favor intente nuevamente.', 'INTERNAL_ERROR');
    }
    build(status, error, code, field) {
        return {
            status,
            body: { success: false, data: null, error, code, ...(field ? { field } : {}) },
        };
    }
    extractUniqueField(message) {
        const match = /Key \((\w+)\)/.exec(message);
        return match ? match[1] : null;
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map