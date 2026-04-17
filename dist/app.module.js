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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_1 = require("@mikro-orm/nestjs");
const common_2 = require("@nestjs/common");
const mikro_orm_config_1 = require("./database/mikro-orm.config");
const auth_module_1 = require("./modules/auth/auth.module");
const migration_runner_service_1 = require("./database/migration-runner.service");
const seed_superadmin_service_1 = require("./database/seed-superadmin.service");
let HealthController = class HealthController {
    health() {
        return { status: 'ok' };
    }
};
__decorate([
    (0, common_2.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "health", null);
HealthController = __decorate([
    (0, common_2.Controller)()
], HealthController);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            nestjs_1.MikroOrmModule.forRoot(mikro_orm_config_1.default),
            auth_module_1.AuthModule,
        ],
        controllers: [HealthController],
        providers: [migration_runner_service_1.MigrationRunnerService, seed_superadmin_service_1.SeedSuperadminService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map