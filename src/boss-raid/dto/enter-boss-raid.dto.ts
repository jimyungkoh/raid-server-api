import { IsNumber } from 'class-validator';

export class EnterBossRaidDto {
  @IsNumber()
  readonly userId: number;

  level: number;
}
