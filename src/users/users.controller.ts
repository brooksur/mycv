import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Param,
  Query,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { EmailPasswordDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UsersService } from './users.service'
import { AuthService } from './auth.service'
import { Serialize } from '../interceptors/serialize.interceptor'
import { UserDto } from './dtos/user.dto'

@Serialize(UserDto)
@Controller('auth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  createUser(@Body() body: EmailPasswordDto) {
    return this.authService.signup(body.email, body.password)
  }

  @Post('/signin')
  signin(@Body() body: EmailPasswordDto) {
    return this.authService.signin(body.email, body.password)
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id))

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email)
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id))
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body)
  }
}
