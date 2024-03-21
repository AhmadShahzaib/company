import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TimeZone {
  tzCode: string;
  utc: string;
  label?: string;
  name?: string;
}
