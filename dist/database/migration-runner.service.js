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
var MigrationRunnerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRunnerService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@mikro-orm/core");
let MigrationRunnerService = MigrationRunnerService_1 = class MigrationRunnerService {
    orm;
    logger = new common_1.Logger(MigrationRunnerService_1.name);
    constructor(orm) {
        this.orm = orm;
    }
    async onModuleInit() {
        this.logger.log('Running schema update...');
        const generator = this.orm.schema;
        await generator.update();
        this.logger.log('Schema up to date.');
    }
};
exports.MigrationRunnerService = MigrationRunnerService;
exports.MigrationRunnerService = MigrationRunnerService = MigrationRunnerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.MikroORM])
], MigrationRunnerService);
//# sourceMappingURL=migration-runner.service.js.map