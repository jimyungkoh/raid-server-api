import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BossRaidService } from './boss-raid.service';
import { RedisModule } from '../database';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { BossRaidController } from './boss-raid.controller';
import { ConfigModule } from '../config';
import { BossRaidHistory } from './entities/bossRaidHistory.entity';

@Module({
  controllers: [BossRaidController],
  providers: [BossRaidService, UserService],
  imports: [
    HttpModule,
    RedisModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, BossRaidHistory]),
  ],
})
export class BossRaidModule {}
