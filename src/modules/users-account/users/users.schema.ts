import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

export type UserDocument = HydratedDocument<User>;

export class NewPassword {
  @Prop()
  confirmationCode: string;
}

export class EmailConfirmation {
  @Prop()
  confirmationCode: string;
  @Prop()
  expirationDate: Date;
  @Prop()
  isConfirmed: boolean;
}

@Schema({ collection: 'users' })
export class User {
  @Prop()
  id: string;
  @Prop()
  login: string;
  @Prop()
  email: string;
  @Prop()
  passwordHash: string;
  @Prop()
  passwordSalt: string;
  @Prop()
  createdAt: Date;
  @Prop()
  emailConfirmation: EmailConfirmation;
  @Prop()
  newPassword: NewPassword;

  static createInstance(
    dto: CreateUserDto,
    passwordHash,
    passwordSalt,
  ): UserDocument {
    const user = new User();
    user.id = (Date.now() + Math.random()).toString();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = passwordHash;
    user.passwordSalt = passwordSalt;
    user.createdAt = new Date();

    return user as UserDocument;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
