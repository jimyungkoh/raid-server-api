import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BossRaidService } from './boss-raid.service';
import { CreateBossRaidDto } from './dto/create-boss-raid.dto';
import { UpdateBossRaidDto } from './dto/update-boss-raid.dto';

@Controller('boss-raid')
export class BossRaidController {
  constructor(private readonly bossRaidService: BossRaidService) {}

  @Post()
  create(@Body() createBossRaidDto: CreateBossRaidDto) {
    return this.bossRaidService.create(createBossRaidDto);
  }

  @Get()
  findAll() {
    return this.bossRaidService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bossRaidService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBossRaidDto: UpdateBossRaidDto) {
    return this.bossRaidService.update(+id, updateBossRaidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bossRaidService.remove(+id);
  }
}
