// Custom validators 또는 DTO 파일 내부에 구현

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsPasswordRequired(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPasswordRequired',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedPropertyName = 'isPublic';
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (relatedValue === false) {
            return value != null && value !== '';
          }
          return true; // 공개 채팅방인 경우 password 검증을 스킵
        },
        defaultMessage(args: ValidationArguments) {
          return '비공개 채팅방에서는 비밀번호가 필수입니다.';
        },
      },
    });
  };
}
