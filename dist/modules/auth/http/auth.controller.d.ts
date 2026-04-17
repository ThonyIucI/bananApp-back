import { Response } from 'express';
import { LoginDto } from './dtos/login.dto';
import { LoginHandler } from '../commands/login.handler';
import { JwtPayload } from '../infrastructure/jwt.strategy';
export declare class AuthController {
    private readonly loginHandler;
    constructor(loginHandler: LoginHandler);
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            isSuperadmin: boolean;
        };
    }>;
    me(user: JwtPayload): JwtPayload;
}
