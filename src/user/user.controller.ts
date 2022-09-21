import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FindUserDto } from './dto/find-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(): Promise<CreateUserDto | undefined> {
    return this.userService.create();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindUserDto | undefined> {
    return new FindUserDto(await this.userService.findOne(+id));
  }
}
