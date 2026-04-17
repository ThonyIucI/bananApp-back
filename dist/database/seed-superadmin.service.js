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
var SeedSuperadminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedSuperadminService = void 0;
const common_1 = require("@nestjs/common");
const postgresql_1 = require("@mikro-orm/postgresql");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../modules/users/domain/user.entity");
const SUPERADMIN_EMAIL = 'thonyiuci@gmail.com';
const SUPERADMIN_PASSWORD = 'canamas365';
let SeedSuperadminService = SeedSuperadminService_1 = class SeedSuperadminService {
    em;
    logger = new common_1.Logger(SeedSuperadminService_1.name);
    constructor(em) {
        this.em = em;
    }
    async onApplicationBootstrap() {
        await this.em.transactional(async (em) => {
            const exists = await em.findOne(user_entity_1.User, { email: SUPERADMIN_EMAIL });
            if (exists)
                return;
            const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 12);
            const superadmin = user_entity_1.User.make({
                firstName: 'Thony',
                lastName: 'Admin',
                email: SUPERADMIN_EMAIL,
                passwordHash,
            });
            superadmin.isSuperadmin = true;
            em.persist(superadmin);
            this.logger.log(`Superadmin creado: ${SUPERADMIN_EMAIL}`);
        });
    }
};
exports.SeedSuperadminService = SeedSuperadminService;
exports.SeedSuperadminService = SeedSuperadminService = SeedSuperadminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [postgresql_1.EntityManager])
], SeedSuperadminService);
//# sourceMappingURL=seed-superadmin.service.js.map