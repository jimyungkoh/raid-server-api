import { IsNotEmpty, IsNumber } from 'class-validator';

export class EnterBossRaidDto {
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly level: number;
}
