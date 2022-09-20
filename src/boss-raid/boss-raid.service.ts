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
    let raidInfo = bossRaids.levels[enterBossRaidRequestDto.level];

    // 보스 레이드에 존재하지 않는 level 값이 입력됐다면, NotFoundException
    if (!raidInfo) {
      throw new NotFoundException(
        `level '${enterBossRaidRequestDto.level}' isn't in bossRaids.`
      );
    }

    const currentRaid = await this.bossRaidHistoryRepository.save(
      new BossRaidHistory(user)
    );

    raidInfo = Object.assign(raidInfo, {
      enteredUserId: user.id,
      raidRecordId: currentRaid.raidRecordId,
    });

    await this.redisService.set('currentRaid', raidInfo, {
      ttl: bossRaids.bossRaidLimitSeconds,
    });

    return new EnterBossRaidResponseDto(currentRaid.raidRecordId);
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
