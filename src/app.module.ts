import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BossRaidModule } from './boss-raid/boss-raid.module';
import { MySQLModule, RedisModule } from './database';

@Module({
  imports: [MySQLModule, RedisModule, UserModule, BossRaidModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
