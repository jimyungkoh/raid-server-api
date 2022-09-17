import { Injectable } from '@nestjs/common';
import { CreateBossRaidDto } from './dto/create-boss-raid.dto';
import { UpdateBossRaidDto } from './dto/update-boss-raid.dto';

@Injectable()
export class BossRaidService {
  create(createBossRaidDto: CreateBossRaidDto) {
    return 'This action adds a new bossRaid';
  }

  findAll() {
    return `This action returns all bossRaid`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bossRaid`;
  }

  update(id: number, updateBossRaidDto: UpdateBossRaidDto) {
    return `This action updates a #${id} bossRaid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bossRaid`;
  }
}
