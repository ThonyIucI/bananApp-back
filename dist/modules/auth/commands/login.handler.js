"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHandler = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const postgresql_1 = require("@mikro-orm/postgresql");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../users/domain/user.entity");
const domain_exception_1 = require("../../shared/exceptions/domain.exception");
let LoginHandler = class LoginHandler {
    em;
    jwtService;
    constructor(em, jwtService) {
        this.em = em;
        this.jwtService = jwtService;
    }
    async execute(command) {
        const user = await this.em.findOne(user_entity_1.User, { email: command.email.toLowerCase() });
        if (!user || !user.isActive) {
            throw new domain_exception_1.UnauthorizedException('Credenciales inválidas');
        }
        if (user.isLocked()) {
            throw new domain_exception_1.BusinessRuleException('Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 15 minutos.');
        }
        const passwordValid = await bcrypt.compare(command.password, user.passwordHash);
        if (!passwordValid) {
            user.recordFailedLogin();
            await this.em.flush();
            throw new domain_exception_1.UnauthorizedException('Credenciales inválidas');
        }
        user.recordSuccessfulLogin();
        await this.em.flush();
        const payload = {
            sub: user.id,
            email: user.email,
            isSuperadmin: (user.isSuperadmin ?? false),
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET ?? 'dev_secret_change_me',
            expiresIn: 3600,
        });
        const refreshToken = this.jwtService.sign({ sub: user.id }, {
            secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me',
            expiresIn: 2592000,
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                isSuperadmin: user.isSuperadmin ?? false,
            },
        };
    }
};
exports.LoginHandler = LoginHandler;
exports.LoginHandler = LoginHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [postgresql_1.EntityManager,
        jwt_1.JwtService])
], LoginHandler);
//# sourceMappingURL=login.handler.js.map