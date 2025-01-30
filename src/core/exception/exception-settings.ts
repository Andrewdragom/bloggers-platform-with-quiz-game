import { BadRequestException } from '@nestjs/common';

export const exceptionFactory = (errors) => {
  const errorsForResponse = [];

  errors.forEach((e) => {
    // @ts-ignore
    const constrainsKeys = Object.keys(e.constraints);
    constrainsKeys.forEach((cKey) => {
      // @ts-ignore
      errorsForResponse.push({
        message: e.constraints![cKey],
        field: e.property,
      });
    });
  });
  throw new BadRequestException(errorsForResponse);
};
