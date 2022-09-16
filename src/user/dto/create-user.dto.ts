import { IsNumber } from 'class-validator';

export class CreateUserDto {
  constructor(id: number) {
    this.id = id;
  }

  @IsNumber()
  readonly id: number;
}
