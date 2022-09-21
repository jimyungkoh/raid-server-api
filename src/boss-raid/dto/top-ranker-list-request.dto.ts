import { IsNotEmpty, IsNumber } from 'class-validator';

export class TopRankerListRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
