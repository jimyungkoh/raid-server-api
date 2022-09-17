import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MySQLModule } from './database/MySQLModule';
import { BossRaidModule } from './boss-raid/boss-raid.module';

@Module({
  imports: [MySQLModule, UserModule, BossRaidModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
