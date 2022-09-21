import { IsNotEmpty, IsNumber } from 'class-validator';

export class TopRankerListResponseDto {
  ranking: number;
  userId: number;
  totalScore: number;
}
