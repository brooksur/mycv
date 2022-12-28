import { IsEmail, IsString } from 'class-validator'

export class EmailPasswordDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}
