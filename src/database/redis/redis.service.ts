import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache
  ) {}

  async get(key: string): Promise<any> {
    return await this.cache.get(key);
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
}
