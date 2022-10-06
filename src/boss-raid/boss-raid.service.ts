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
  TopRankerListRequestDto,
} from './dto';
import Message from './boss-raid.message';

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

  async findTopRankerList(
    topRankerListRequestDto: TopRankerListRequestDto
  ): Promise<any | undefined> {
    let topRankerList = await this.redisService.get('topRankerList');

    if (!topRankerList) {
      topRankerList = await this.setTopRankerList();
    }

    return {
      topRankerList: topRankerList,
    };
  }

  /**
   * @description 요구사항 4. 보스레이드 시작
   * @param {EnterBossRaidRequestDto} enterBossRaidRequestDto
   * @returns {Promise<FindBossRaidStatusDto>}
   */
  async enter(
    enterBossRaidRequestDto: EnterBossRaidRequestDto
  ): Promise<EnterBossRaidResponseDto> {
    const inUseRaid = await this.redisService.get('currentRaid');

    if (!!inUseRaid) {
      throw new BadRequestException(
        Message.BAD_REQUEST_ENTER + inUseRaid.raidRecordId
      );
    }

    const user = await this.userService.findOne(enterBossRaidRequestDto.userId);

    const bossRaids = await this.findBossRaids();
    let raidInfo = bossRaids.levels[enterBossRaidRequestDto.level];

    // 보스 레이드에 존재하지 않는 level 값이 입력됐다면, NotFoundException
    if (!raidInfo) {
      throw new NotFoundException(Message.BAD_REQUEST_LEVEL_INPUT);
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
    const currentRaid = await this.redisService.get('currentRaid');

    this.validateCurrentRaid(endBossRaidRequestDto, currentRaid);

    const raid = await this.bossRaidHistoryRepository.findOneBy({
      raidRecordId: endBossRaidRequestDto.raidRecordId,
    });

    raid.score = currentRaid.score;

    await Promise.all([
      this.bossRaidHistoryRepository.save(raid),
      this.userService.renewTotalScore(endBossRaidRequestDto.userId),
      this.setTopRankerList(),
      this.redisService.del('currentRaid'),
    ]);
  }

  private async findBossRaids() {
    let staticData = await this.redisService.get('bossRaids');

    if (!staticData) {
      const url = this.configService.get('BOSS_RAIDS_URL');
      const { data } = await firstValueFrom(this.httpService.get(url));

      staticData = data;

      await this.redisService.set('bossRaids', staticData, { ttl: 0 });

      console.log(staticData.bossRaids[0]);
    }

    return staticData.bossRaids[0];
  }

  private validateCurrentRaid(
    endBossRaidRequestDto: EndBossRaidRequestDto,
    currentRaid: any
  ) {
    if (!currentRaid) {
      throw new NotFoundException(Message.NOT_FOUND_CURRENT_RAID);
    }

    if (currentRaid.enteredUserId !== endBossRaidRequestDto.userId) {
      throw new BadRequestException(Message.BAD_REQUEST_USER);
    }

    if (currentRaid.raidRecordId !== endBossRaidRequestDto.raidRecordId) {
      throw new BadRequestException(Message.BAD_REQUEST_RAID);
    }
  }

  private async setTopRankerList(): Promise<any> {
    const topRankerList = [];

    const topRankers = await this.userService.findTopRankers();

    for (const idx in topRankers) {
      topRankerList.push({
        ranking: parseInt(topRankers[idx].ranking) - 1,
        userId: topRankers[idx].userId,
        totalScore: topRankers[idx].totalScore,
      });
    }

    await this.redisService.set('topRankerList', topRankerList, {
      ttl: 0,
    });

    return topRankerList;
  }
}
