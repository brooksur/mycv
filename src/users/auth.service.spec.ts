import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersService } from './users.service'
import { User } from './user.entity'

describe('AuthService', () => {
  let service: AuthService,
    fakeUsersService: Partial<UsersService>,
    users: User[]

  beforeEach(async () => {
    users = []
    fakeUsersService = {
      find: (email: string) => {
        return Promise.resolve(users.filter((user) => user.email === email))
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 10000),
          email,
          password,
        } as User
        users.push(user)
        return Promise.resolve(user)
      },
    }

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined()
  })

  it('creates a new user with a salted and hashed password', async () => {
    const [email, password] = ['a', '1']
    const user = await service.signup(email, password)
    expect(user).toHaveProperty('id', expect.any(Number))
    expect(user).toHaveProperty('email', email)
    expect(user.password).not.toEqual(password)
    const [salt, hash] = user.password.split('.')
    expect(salt).toBeDefined()
    expect(hash).toBeDefined()
  })

  it('throws an error if user signs up with email that is in use', async () => {
    const [email, password] = ['a', '1']
    await service.signup(email, password)
    await expect(service.signup(email, password)).rejects.toThrow(
      BadRequestException,
    )
  })

  it('throws if signin is called with an unused email', async () => {
    const [email, password] = ['a', '1']
    await service.signup(email, password)
    await expect(service.signin('a', '2')).rejects.toThrow(NotFoundException)
  })

  it('throws if an invalid password is provided', async () => {
    const [email, password] = ['a', '1']
    await service.signup(email, password)
    await expect(service.signin('a', '2')).rejects.toThrow(NotFoundException)
  })

  it('returns a user if correct password is provided', async () => {
    const [email, password] = ['a', '1']
    await service.signup(email, password)
    const user = await service.signin('a', '1')
    expect(user).toBeDefined()
  })
})
