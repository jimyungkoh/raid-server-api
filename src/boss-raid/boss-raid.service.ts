import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EnterBossRaidDto } from './dto/enter-boss-raid.dto';
import { RedisService } from '../database/redis/redis.service';
import { FindBossRaidStatusDto } from './dto/find-boss-raid-status-dto';
import { UserService } from '../user/user.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config';
import { BossRaidHistory } from './entities/bossRaidHistory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnterBossRaidResultDto } from './dto/enter-boss-raid-result.dto';

@Injectable()
export class BossRaidService {
  constructor(
    @InjectRepository(BossRaidHistory)
    private bossRaidHistoryRepository: Repository<BossRaidHistory>,
    @Inject(RedisService) private redisService: RedisService,
    @Inject(UserService) private userService: UserService,
    @Inject(HttpService) private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  /**
   * @description 요구사항 3. 보스레이드 상태 조회
   * @returns {Promise<FindBossRaidStatusDto>}
   */
  async findRaidStatus(): Promise<FindBossRaidStatusDto> {
    const currentRaid = await this.redisService.get('currentRaid');

    const raidStatus = new FindBossRaidStatusDto();

    if (!!currentRaid) {
      raidStatus.canEnter = false;
      raidStatus.enteredUserId = parseInt(currentRaid.enteredUserId);
    } else {
      delete raidStatus.enteredUserId;
    }

    return raidStatus;
  }

  /**
   * @description 요구사항 4. 보스레이드 시작
   * @param {EnterBossRaidDto} enterBossRaidDto
   * @returns {Promise<FindBossRaidStatusDto>}
   */
  async enter(
    enterBossRaidDto: EnterBossRaidDto
  ): Promise<EnterBossRaidResultDto> {
    const user = await this.userService.findOne(enterBossRaidDto.userId);

    const bossRaids = await this.findBossRaids();

    const currentRaid = bossRaids.levels[enterBossRaidDto.level];

    if (!currentRaid) {
      throw new NotFoundException(
        `level '${enterBossRaidDto.level}' isn't in bossRaids.`
      );
    }

    currentRaid.enteredUserId = user.id;

    const timeLimit = bossRaids.bossRaidLimitSeconds;

    await this.redisService.set('currentRaid', currentRaid, { ttl: timeLimit });

    const bossRaidHistory = new BossRaidHistory();
    bossRaidHistory.user = user;

    const newHistory = await this.bossRaidHistoryRepository.save(
      bossRaidHistory
    );

    return new EnterBossRaidResultDto(newHistory.raidRecordId);
  }

  async findBossRaids() {
    let staticData = await this.redisService.get('bossRaids');

    if (!staticData) {
      const url = this.configService.get('BOSS_RAIDS_URL');
      const { data } = await firstValueFrom(this.httpService.get(url));

      staticData = data;

      await this.redisService.set('bossRaids', staticData);
    }

    return staticData.bossRaids[0];
  }
}
