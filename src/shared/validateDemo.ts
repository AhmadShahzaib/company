import { FilterQuery } from 'mongoose';
import timezones from 'timezones-list';
import { CompaniesRequest } from 'models';
import { CompaniesService } from '../app.service';
import DemoDocument from 'mongoDb/document/Demo.document';
import { NotFoundException, Logger, ConflictException } from '@nestjs/common';
export const validateDemo = async (
  companyService: CompaniesService,
  requestModel,
  option: FilterQuery<DemoDocument>,
  vehicleId: string = null,
 ) => {
  try {
    const company = await companyService.findOneDemo(option);
    if (company?.email.toLowerCase() == requestModel.email.toLowerCase()) {
      Logger.log(`Email already exists`);
      throw new ConflictException(`Email already exists`);
    }
    if (company?.name.toLowerCase() == requestModel.name.toLowerCase()) {
      Logger.log(`Company name already exists`);
      throw new ConflictException(`Company name already exists`);
    }
  
    if (company?.usdot == requestModel.usdot) {
      Logger.log(`Usdot already exists`);
      throw new ConflictException(`Usdot already exists`);
    }
      if (company?.phoneNumber == requestModel.phoneNumber) {
      Logger.log(`${requestModel.phoneNumber} Phone number already exists`);
      throw new ConflictException(`Phone number already exists`);
    }
    const index = timezones.findIndex((ele) => {
      return ele.tzCode === (requestModel.timeZone as string);
    });
    if (index >= 0) {
      requestModel.timeZone = timezones[index];
    } else {
      throw new NotFoundException(`TimeZone you select does not exist`);
    }
    return requestModel;
  } catch (err) {
    throw err;
  }
};
