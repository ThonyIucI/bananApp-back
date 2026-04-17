"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const nestjs_1 = require("@mikro-orm/nestjs");
const user_entity_1 = require("../users/domain/user.entity");
const jwt_strategy_1 = require("./infrastructure/jwt.strategy");
const login_handler_1 = require("./commands/login.handler");
const auth_controller_1 = require("./http/auth.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.register({}),
            nestjs_1.MikroOrmModule.forFeature([user_entity_1.User]),
        ],
        providers: [jwt_strategy_1.JwtStrategy, login_handler_1.LoginHandler],
        controllers: [auth_controller_1.AuthController],
        exports: [jwt_strategy_1.JwtStrategy, login_handler_1.LoginHandler],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map