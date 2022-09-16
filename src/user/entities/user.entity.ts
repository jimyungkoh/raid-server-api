import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({})
  id: number;

  @Column({ nullable: false, default: 0 })
  totalScore: number;
}
