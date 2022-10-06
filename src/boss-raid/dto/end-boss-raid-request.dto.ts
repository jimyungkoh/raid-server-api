import { IsNotEmpty, IsNumber } from 'class-validator';

export class EndBossRaidRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  raidRecordId: number;
}
