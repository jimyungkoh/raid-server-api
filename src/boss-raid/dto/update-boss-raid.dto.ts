import { PartialType } from '@nestjs/mapped-types';
import { EnterBossRaidDto } from './enter-boss-raid.dto';

export class UpdateBossRaidDto extends PartialType(EnterBossRaidDto) {}
