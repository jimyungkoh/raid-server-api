import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MySQLModule } from './database/MySQLModule';

@Module({
  imports: [MySQLModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
