import { IsNumber } from 'class-validator';
import { BossRaidHistory } from '../../boss-raid/entities/bossRaidHistory.entity';
import { User } from '../entities/user.entity';

export class FindUserDto {
  constructor(user: User) {
    this.totalScore = user.totalScore;
    this.bossRaidHistory = user.bossRaidHistories;
  }

  @IsNumber()
  readonly totalScore: number;

  readonly bossRaidHistory: BossRaidHistory[];
}
