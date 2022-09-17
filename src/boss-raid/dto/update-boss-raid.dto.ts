import { PartialType } from '@nestjs/mapped-types';
import { CreateBossRaidDto } from './create-boss-raid.dto';

export class UpdateBossRaidDto extends PartialType(CreateBossRaidDto) {}
