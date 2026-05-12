export class VerifyEmailCommand {
  constructor(
    public readonly userId: string,
    public readonly code: string,
  ) {}
}

export interface VerifyEmailResult {
  success: true;
  alreadyVerified?: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
