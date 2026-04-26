export interface CreateUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dni?: string;
  mustChangePassword?: boolean;
}
