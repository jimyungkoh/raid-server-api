export class EnterBossRaidResponseDto {
  constructor(raidRecordId: number) {
    this.raidRecordId = raidRecordId;
  }

  isEntered?: boolean = true;
  raidRecordId: number;
}
