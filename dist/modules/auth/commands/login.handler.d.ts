import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { LoginCommand, LoginResult } from './login.command';
export declare class LoginHandler {
    private readonly em;
    private readonly jwtService;
    constructor(em: EntityManager, jwtService: JwtService);
    execute(command: LoginCommand): Promise<LoginResult>;
}
