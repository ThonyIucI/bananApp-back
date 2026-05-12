import { createHash, randomInt } from 'crypto';

export const generateSixDigitCode = (): string =>
  randomInt(100000, 999999).toString();

export const hashCode = (code: string): string =>
  createHash('sha256').update(code).digest('hex');
