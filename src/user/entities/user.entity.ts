import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BossRaidHistory } from '../../boss-raid/entities/bossRaidHistory.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({})
  id: number;

  @Column({ nullable: false, default: 0 })
  totalScore: number;

  @OneToMany(() => BossRaidHistory, (bossRaidHistory) => bossRaidHistory.user, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  bossRaidHistories: BossRaidHistory[];
}
