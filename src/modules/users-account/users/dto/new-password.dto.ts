import { IsNotEmpty, Length } from 'class-validator';

export class NewPasswordDto {
  @Length(6, 20)
  @IsNotEmpty()
  newPassword: string;
  recoveryCode: string;
}
