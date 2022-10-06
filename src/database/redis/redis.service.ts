import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import IORedis from 'ioredis';

@Injectable()
export class RedisService {
  readonly redisClient: IORedis;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: IORedis
  ) {
    this.redisClient = cache;
  }

  async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async set(key: string, value: any, option?: any): Promise<void> {
    await this.cache.set(key, value, option);
  }

  async reset(): Promise<void> {
    await this.cache.reset();
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  // async zadd(key: string, score: number, userId: number) {
  //   await this.cache.zadd(key, score, userId);
  // }
}
