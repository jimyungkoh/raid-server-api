import { Inject, Injectable } from '@nestjs/common';
import { EnterBossRaidDto } from './dto/enter-boss-raid.dto';
import { RedisService } from '../database/redis/redis.service';
import { FindBossRaidStatusDto } from './dto/find-boss-raid-status-dto';
import { UserService } from '../user/user.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config';

@Injectable()
export class BossRaidService {
  constructor(
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
    const enteredUserId = await this.redisService.get('enteredUserId');

    const raidStatus = new FindBossRaidStatusDto();

    if (!!enteredUserId) {
      raidStatus.canEnter = false;
      raidStatus.enteredUserId = parseInt(enteredUserId);
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
  ): Promise<FindBossRaidStatusDto> {
    const user = await this.userService.findOne(enterBossRaidDto.userId);

    await this.redisService.set('enteredUserId', user.id, { ttl: 180 });

    return this.findRaidStatus();
  }

  async findBossRaids() {
    let bossRaids = await this.redisService.get('bossRaids');

    if (!bossRaids) {
      const url = this.configService.get('BOSS_RAIDS_URL');
      const { data } = await firstValueFrom(this.httpService.get(url));

      bossRaids = data;

      await this.redisService.set('bossRaids', bossRaids);
    }

    return bossRaids;
  }
}
