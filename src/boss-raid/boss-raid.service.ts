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
    const currentRaid = await this.redisService.get('currentRaid');

    this.validateCurrentRaid(endBossRaidRequestDto, currentRaid);

    const raid = await this.bossRaidHistoryRepository.findOneBy({
      raidRecordId: endBossRaidRequestDto.raidRecordId,
    });

    raid.score = currentRaid.score;

    await this.bossRaidHistoryRepository.save(raid);
  }

  private async findBossRaids() {
    let staticData = await this.redisService.get('bossRaids');

    if (!staticData) {
      const url = this.configService.get('BOSS_RAIDS_URL');
      const { data } = await firstValueFrom(this.httpService.get(url));

      staticData = data;

      await this.redisService.set('bossRaids', staticData);
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
}
