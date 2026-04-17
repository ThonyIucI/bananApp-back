"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneNumberVO = void 0;
const domain_exception_1 = require("../exceptions/domain.exception");
const CALLING_CODE_REGEX = /^\+\d{1,4}$/;
const NUMBER_REGEX = /^\d{6,15}$/;
class PhoneNumberVO {
    callingCode;
    number;
    constructor(callingCode, number) {
        this.callingCode = callingCode;
        this.number = number;
    }
    static create(callingCode, number) {
        if (!CALLING_CODE_REGEX.test(callingCode)) {
            throw new domain_exception_1.DomainException(`Invalid calling code: ${callingCode}`, 'INVALID_PHONE_CALLING_CODE');
        }
        if (!NUMBER_REGEX.test(number)) {
            throw new domain_exception_1.DomainException(`Invalid phone number: ${number}`, 'INVALID_PHONE_NUMBER');
        }
        return new PhoneNumberVO(callingCode, number);
    }
    full() {
        return `${this.callingCode}${this.number}`;
    }
}
exports.PhoneNumberVO = PhoneNumberVO;
//# sourceMappingURL=phone-number.vo.js.map