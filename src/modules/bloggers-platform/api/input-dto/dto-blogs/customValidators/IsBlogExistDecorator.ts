import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsBlogIdExistConstraint } from './IsBlogIdExist-custom-validator';

export function IsBlogIdExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsBlogIdExistConstraint,
    });
  };
}
