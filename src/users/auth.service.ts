import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    const emailInUse = Boolean((await this.usersService.find(email)).length)

    if (emailInUse) {
      throw new BadRequestException('Email in use')
    }

    const salt = randomBytes(8).toString('hex')
    const hash = (await scryptAsync(password, salt, 32)) as Buffer
    const hashedPassword = salt + '.' + hash.toString('hex')

    return this.usersService.create(email, hashedPassword)
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email)

    if (!user) {
      throw new NotFoundException('Invalid credentials')
    }

    const [salt, storedHash] = user.password.split('.')
    const hash = (await scryptAsync(password, salt, 32)) as Buffer

    if (storedHash !== hash.toString('hex')) {
      throw new NotFoundException('Invalid credentials')
    }

    return user
  }
}
