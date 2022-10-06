import { IsBoolean, IsNumber } from 'class-validator';

export class FindBossRaidStatusDto {
  @IsBoolean()
  canEnter?: boolean = true;

  @IsNumber()
  enteredUserId: number;
}
