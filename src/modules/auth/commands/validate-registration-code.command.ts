export interface ValidateRegistrationCodeCommand {
  email: string;
  code: string;
}

export interface ValidateRegistrationCodeResult {
  message: string;
}
