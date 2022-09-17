import { Test, TestingModule } from '@nestjs/testing';
import { BossRaidController } from './boss-raid.controller';
import { BossRaidService } from './boss-raid.service';

describe('BossRaidController', () => {
  let controller: BossRaidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BossRaidController],
      providers: [BossRaidService],
    }).compile();

    controller = module.get<BossRaidController>(BossRaidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
