import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength ,IsOptional} from 'class-validator';
import { TimeZone } from './timeZone.model';
import { Documents } from 'mongoDb/document/Company.document';

export class CompaniesRequest {

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(50)
  @IsString()
  name?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address?: string;

  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @IsString()
  timeZone?: TimeZone | string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(12)
  usdot?: string;
  companyProfile?: Documents;
  profile?: Documents = {};
  documents?: Documents[] = [];

}
