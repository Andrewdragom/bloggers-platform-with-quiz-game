import { IsNotEmpty, Length, Matches } from 'class-validator';

export class LoginUserDto {
  id: string;
  @Matches(/^[a-zA-Z0-9_-]*$|^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'Login Or Email format is invalid',
  })
  loginOrEmail: string;
  @Length(6, 20)
  @IsNotEmpty()
  password: string;
}
