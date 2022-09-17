import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '../../config';
import { Module } from '@nestjs/common';
import { TypeOrmService } from './typeorm.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmService,
      inject: [ConfigService],
    }),
  ],
})
export class MySQLModule {}
