import { ApiProperty } from '@nestjs/swagger';
import CompanyDocument from 'mongoDb/document/Company.document';
import { TimeZone } from './timeZone.model';

export class CompaniesResponse {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  address?: string;

  @ApiProperty()
  timeZone?: TimeZone;

  @ApiProperty()
  contactPerson?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  usdot?: string;

  constructor(companyDocument: CompanyDocument) {
    this.id = companyDocument.id;
    this.name = companyDocument.name;
    this.address = companyDocument.address;
    this.timeZone = companyDocument.timeZone;
    this.email = companyDocument.email;
    this.phoneNumber = companyDocument.phoneNumber;
    this.contactPerson = companyDocument.contactPerson;
    this.usdot = companyDocument.usdot;
  }
}
