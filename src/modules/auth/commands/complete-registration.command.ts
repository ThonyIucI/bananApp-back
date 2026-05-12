export interface CompleteRegistrationCommand {
  email: string;
  code: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface CompleteRegistrationResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    isSuperadmin: boolean;
  };
}
