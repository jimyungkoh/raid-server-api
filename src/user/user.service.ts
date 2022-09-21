import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { BossRaidHistory } from '../boss-raid/entities/bossRaidHistory.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BossRaidHistory)
    private bossRaidHistoryRepository: Repository<BossRaidHistory>
  ) {}

  async create(): Promise<CreateUserDto | undefined> {
    const user = new User();

    await this.userRepository.save(user);

    return new CreateUserDto(user.id);
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      relations: ['bossRaidHistories'],
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException(`user.id '${id}' isn't in the user table.`);
    }

    return user;
  }

  async findTopRankers(): Promise<any> {
    return await this.userRepository
      .createQueryBuilder('user')
      .select('ROW_NUMBER () OVER (ORDER BY "total_score" DESC)', 'ranking')
      .addSelect('user.id', 'userId')
      .addSelect('user.totalScore', 'totalScore')
      .getRawMany();
  }

  async renewTotalScore(enteredUserId: number) {
    const scoreInfo = await this.bossRaidHistoryRepository
      .createQueryBuilder('bossRaidHistory')
      .select('SUM(bossRaidHistory.score)', 'totalScore')
      .where('bossRaidHistory.user_id = :enteredUserId', { enteredUserId })
      .getRawOne();

    const user = await this.userRepository.findOneBy({ id: enteredUserId });

    user.totalScore = scoreInfo.totalScore;

    return await this.userRepository.save(user);
  }
}
