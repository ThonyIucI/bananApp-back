"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const core_1 = require("@mikro-orm/core");
const base_entity_1 = require("../../shared/base.entity");
const domain_exception_1 = require("../../shared/exceptions/domain.exception");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DNI_REGEX = /^\d{8}$/;
const UserSchema = (0, core_1.defineEntity)({
    name: 'User',
    properties: {
        ...base_entity_1.BaseProperties,
        firstName: core_1.p.string().length(100),
        lastName: core_1.p.string().length(100),
        email: core_1.p.string().length(150).unique(),
        passwordHash: core_1.p.string().length(255).hidden(),
        dni: core_1.p.string().length(8).nullable(),
        isActive: core_1.p.boolean().default(true),
        isSuperadmin: core_1.p.boolean().default(false),
        mustChangePassword: core_1.p.boolean().default(false),
        failedLoginAttempts: core_1.p.integer().default(0),
        lockedUntil: core_1.p.datetime().nullable(),
        lastLoginAt: core_1.p.datetime().nullable(),
    },
});
class User extends UserSchema.class {
    static make(props) {
        const user = new User();
        user.firstName = props.firstName.trim();
        user.lastName = props.lastName.trim();
        user.email = props.email.trim().toLowerCase();
        user.passwordHash = props.passwordHash;
        user.dni = props.dni?.trim() ?? null;
        user.isActive = true;
        user.mustChangePassword = false;
        user.failedLoginAttempts = 0;
        user.validate();
        return user;
    }
    set(props) {
        if (props.firstName !== undefined)
            this.firstName = props.firstName.trim();
        if (props.lastName !== undefined)
            this.lastName = props.lastName.trim();
        if (props.email !== undefined)
            this.email = props.email.trim().toLowerCase();
        if (props.dni !== undefined)
            this.dni = props.dni?.trim() ?? null;
        if (props.isActive !== undefined)
            this.isActive = props.isActive;
        if (props.mustChangePassword !== undefined)
            this.mustChangePassword = props.mustChangePassword;
        this.validate();
    }
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    isLocked() {
        if (!this.lockedUntil)
            return false;
        return this.lockedUntil > new Date();
    }
    recordFailedLogin(maxAttempts = 5, lockMinutes = 15) {
        this.failedLoginAttempts += 1;
        if (this.failedLoginAttempts >= maxAttempts) {
            this.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
        }
    }
    recordSuccessfulLogin() {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
        this.lastLoginAt = new Date();
    }
    validate() {
        if (!this.firstName || this.firstName.length < 2) {
            throw new domain_exception_1.ValidationException('El nombre debe tener al menos 2 caracteres', 'firstName');
        }
        if (!this.lastName || this.lastName.length < 2) {
            throw new domain_exception_1.ValidationException('El apellido debe tener al menos 2 caracteres', 'lastName');
        }
        if (!this.email || !EMAIL_REGEX.test(this.email)) {
            throw new domain_exception_1.ValidationException('El email no tiene un formato válido', 'email');
        }
        if (this.email.length > 150) {
            throw new domain_exception_1.ValidationException('El email no puede superar los 150 caracteres', 'email');
        }
        if (this.dni && !DNI_REGEX.test(this.dni)) {
            throw new domain_exception_1.ValidationException('El DNI debe tener exactamente 8 dígitos', 'dni');
        }
    }
}
exports.User = User;
UserSchema.setClass(User);
//# sourceMappingURL=user.entity.js.map