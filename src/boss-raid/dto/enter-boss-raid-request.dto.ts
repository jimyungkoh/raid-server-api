import { IsNotEmpty, IsNumber } from 'class-validator';

export class EnterBossRaidRequestDto {
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly level: number;
}
