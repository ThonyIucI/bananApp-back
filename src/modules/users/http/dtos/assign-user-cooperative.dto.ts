import { IsUUID, IsString, IsOptional, IsIn, Matches } from 'class-validator';
import { ROLE_KEYS, RoleKey } from '../../../roles/domain/role.entity';

export class AssignUserCooperativeDto {
  @IsUUID()
  cooperativeId: string;

  @IsString()
  @IsIn(ROLE_KEYS, {
    message: `No tiene un rol válido para realizar esta acción`,
  })
  roleKey: RoleKey;

  @IsOptional()
  @Matches(/^[A-Z0-9]{3,20}$/, {
    message:
      'El código de socio debe tener entre 3 y 20 caracteres alfanuméricos en mayúscula',
  })
  memberCode?: string;
}
