export class RegisterCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}

export interface RegisterResult {
  userId: string;
  email: string;
  requiresEmailVerification: true;
}
