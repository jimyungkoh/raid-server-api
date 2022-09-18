export class EnterBossRaidResultDto {
  constructor(raidRecordId: number) {
    this.raidRecordId = raidRecordId;
  }

  isEntered?: boolean = true;
  raidRecordId: number;
}
