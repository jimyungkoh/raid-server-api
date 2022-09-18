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
    default: null,
    nullable: true,
  })
  endTime?: Date = null;

  @ManyToOne(() => User, (user) => user.bossRaidHistories, {
    nullable: false,
  })
  user: User;
}
