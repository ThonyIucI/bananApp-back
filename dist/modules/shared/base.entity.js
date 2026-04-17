"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProperties = void 0;
const core_1 = require("@mikro-orm/core");
const uuidv7_1 = require("uuidv7");
exports.BaseProperties = {
    id: core_1.p.uuid().primary().onCreate(() => (0, uuidv7_1.uuidv7)()),
    createdAt: core_1.p.datetime().onCreate(() => new Date()),
    updatedAt: core_1.p.datetime()
        .onCreate(() => new Date())
        .onUpdate(() => new Date()),
    deletedAt: core_1.p.datetime().nullable(),
};
//# sourceMappingURL=base.entity.js.map