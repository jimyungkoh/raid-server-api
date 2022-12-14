import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { BossRaidService } from './boss-raid.service';
import {
  EndBossRaidRequestDto,
  EnterBossRaidRequestDto,
  TopRankerListRequestDto,
} from './dto';

@Controller('boss-raid')
export class BossRaidController {
  constructor(private readonly bossRaidService: BossRaidService) {}

  @Get('')
  findRaidStatus() {
    return this.bossRaidService.findRaidStatus();
  }

  @Post('/top-ranker-list')
  findTopRankerList(@Body() topRankerListDto: TopRankerListRequestDto) {
    return this.bossRaidService.findTopRankerList(topRankerListDto);
  }

  @Post('/enter')
  enter(@Body() enterBossRaidRequestDto: EnterBossRaidRequestDto) {
    return this.bossRaidService.enter(enterBossRaidRequestDto);
  }

  @Patch('/end')
  end(@Body() endBossRaidRequestDto: EndBossRaidRequestDto) {
    return this.bossRaidService.end(endBossRaidRequestDto);
  }
}
