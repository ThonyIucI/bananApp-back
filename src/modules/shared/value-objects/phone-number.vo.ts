import { DomainException } from '../exceptions/domain.exception';

const CALLING_CODE_REGEX = /^\+\d{1,4}$/;
const NUMBER_REGEX = /^\d{6,15}$/;

export class PhoneNumberVO {
  readonly callingCode: string;
  readonly number: string;

  private constructor(callingCode: string, number: string) {
    this.callingCode = callingCode;
    this.number = number;
  }

  static create(callingCode: string, number: string): PhoneNumberVO {
    if (!CALLING_CODE_REGEX.test(callingCode)) {
      throw new DomainException(
        `Invalid calling code: ${callingCode}`,
        'INVALID_PHONE_CALLING_CODE',
      );
    }
    if (!NUMBER_REGEX.test(number)) {
      throw new DomainException(
        `Invalid phone number: ${number}`,
        'INVALID_PHONE_NUMBER',
      );
    }
    return new PhoneNumberVO(callingCode, number);
  }

  full(): string {
    return `${this.callingCode}${this.number}`;
  }
}
