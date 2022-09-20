import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class BossRaidHistory {
  constructor(user: User) {
    this.user = user;
  }

  @PrimaryGeneratedColumn()
  raidRecordId: number;

  @Column({ default: 0, nullable: false })
  score: number;

  @CreateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  enterTime: Date;

  @UpdateDateColumn({
    type: 'datetime',
    nullable: true,
    default: () => null,
  })
  endTime: Date;

  @ManyToOne(() => User, (user) => user.bossRaidHistories, {
    nullable: false,
  })
  user: User;
}
