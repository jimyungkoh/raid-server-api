import { Controller, Get, Post, Body } from '@nestjs/common';
import { BossRaidService } from './boss-raid.service';
import { EnterBossRaidDto } from './dto/enter-boss-raid.dto';

@Controller('boss-raid')
export class BossRaidController {
  constructor(private readonly bossRaidService: BossRaidService) {}

  @Get('')
  findRaidStatus() {
    return this.bossRaidService.findRaidStatus();
  }

  @Post('/enter')
  enter(@Body() enterBossRaidDto: EnterBossRaidDto) {
    return this.bossRaidService.enter(enterBossRaidDto);
  }
}
