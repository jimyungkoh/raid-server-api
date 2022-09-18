import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class BossRaidHistory {
  @PrimaryGeneratedColumn()
  raidRecordId: number;

  @Column()
  score: number;

  @Column({
    type: 'datetime',
  })
  enterTime: Date;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  endTime: Date;

  @ManyToOne(() => User, (user) => user.bossRaidHistories, {
    nullable: false,
  })
  user: User;
}
