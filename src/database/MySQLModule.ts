import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '../config';
import { TypeOrmService } from './index';
import { Module } from '@nestjs/common';

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
