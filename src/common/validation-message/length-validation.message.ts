import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments) => {
  if (args.constraints.length === 2) {
    //최소, 최대가 있을 때
    return `${args.property}은 ${args.constraints[0]}~${args.constraints[1]}글자를 입력해주세요.`;
  } else {
    //최소만 있을 때
    return `${args.property}은 최소 ${args.constraints[0]}글자 이상이어야 합니다.`;
  }
};
