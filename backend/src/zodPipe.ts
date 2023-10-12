import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodObject } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) { }

  transform(value: unknown, metadata: ArgumentMetadata) {
    let parsedValue;
    try {
      parsedValue = this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
    return parsedValue;
  }
}
