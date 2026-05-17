export class GaiaReplyDto {
  text!: string;
}

export class GaiaUsageDto {
  remaining!: number;
  limit!: number;
}

export class GaiaMessageResponseDto {
  reply!: GaiaReplyDto;
  pendingAction!: null;
  usage!: GaiaUsageDto;
}
