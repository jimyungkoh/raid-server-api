import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config';
import { RedisService } from '../database/redis/redis.service';
import { UserService } from '../user/user.service';
import { BossRaidHistory } from './entities/bossRaidHistory.entity';
import { Repository } from 'typeorm';
import {
  EndBossRaidRequestDto,
  EnterBossRaidRequestDto,
  EnterBossRaidResponseDto,
  FindBossRaidStatusDto,
} from './dto';

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
   * @param {EnterBossRaidRequestDto} enterBossRaidRequestDto
   * @returns {Promise<FindBossRaidStatusDto>}
   */
  async enter(
    enterBossRaidRequestDto: EnterBossRaidRequestDto
  ): Promise<EnterBossRaidResponseDto> {
    const user = await this.userService.findOne(enterBossRaidRequestDto.userId);

    const bossRaids = await this.findBossRaids();

    const currentRaid = bossRaids.levels[enterBossRaidRequestDto.level];

    if (!currentRaid) {
      throw new NotFoundException(
        `level '${enterBossRaidRequestDto.level}' isn't in bossRaids.`
      );
    }

    console.log(currentRaid);

    currentRaid.enteredUserId = user.id;

    const timeLimit = bossRaids.bossRaidLimitSeconds;

    const bossRaidHistory = new BossRaidHistory();
    bossRaidHistory.user = user;

    const newHistory = await this.bossRaidHistoryRepository.save(
      bossRaidHistory
    );

    currentRaid.raidRecordId = newHistory.raidRecordId;

    await this.redisService.set('currentRaid', currentRaid, { ttl: timeLimit });

    return new EnterBossRaidResponseDto(newHistory.raidRecordId);
  }

  async end(endBossRaidRequestDto: EndBossRaidRequestDto) {
    const user = await this.userService.findOne(endBossRaidRequestDto.userId);

    const raid = await this.bossRaidHistoryRepository.findOneBy({
      raidRecordId: endBossRaidRequestDto.raidRecordId,
    });

    if (!raid) {
      throw new NotFoundException(
        `raid.raidRecordId '${endBossRaidRequestDto.raidRecordId}' isn't in the raid table.`
      );
    }

    const currentRaid = await this.redisService.get('currentRaid');

    if (!currentRaid) {
      await this.bossRaidHistoryRepository.save(raid);
      throw new NotFoundException(
        "currently, there's no raid (timeout or any user entered in the raid)"
      );
    }

    if (currentRaid.enteredUserId != user.id) {
      throw new BadRequestException("enteredUserId doesn't match!");
    }

    if (currentRaid.raidRecordId !== raid.raidRecordId) {
      throw new BadRequestException("raidRecordId doesn't match!");
    }

    raid.score = currentRaid.score;

    raid.endTime = new Date();

    await this.bossRaidHistoryRepository.save(raid);
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
