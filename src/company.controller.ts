import CompanyDocument from 'mongoDb/document/Company.document';
import { CompaniesRequest, CompaniesResponse } from './models';
import { CompaniesService } from './app.service';
import {
  Controller,
  Body,
  Res,
  InternalServerErrorException,
  HttpException,
  Logger,
  NotFoundException,
  Req,
  HttpStatus,
  UseInterceptors,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import EditCompanyDecorators from './decorators/update';
import timezones from 'timezones-list';
import {
  BaseController,
  MessagePatternResponseInterceptor,
  MongoIdValidationPipe,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import GetCompanyDecorators from 'decorators/getCompanyProfile';
import AddDecorators from 'decorators/add';
import { FilterQuery } from 'mongoose';
import { addAndUpdate } from 'shared/addAndUpdate';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
@Controller('Companies')
@ApiTags('Companies')
export class addController  {
  constructor(private readonly companiesService: CompaniesService,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    @Inject('OFFICE_SERVICE') private readonly officeService: ClientProxy,) {
    
  }

  @Post('/addCompany')
  async addUsers(
    @Body() companyModel,
    @Res() response: Response,
  ) {
    try {
        const {state, companyName,country, address ,firstName,lastName,password, email, usdot, phoneNumber } = companyModel;
       let name = companyName
        const options: FilterQuery<CompanyDocument> = {
          $and: [{ isDeleted: false }],
          $or: [
            { name: { $regex: new RegExp(`^${name}`, 'i') } },
            { email: { $regex: new RegExp(`^${email}`, 'i') } },
            { usdot: { $regex: new RegExp(`^${usdot}`, 'i') } },
            { phoneNumber: { $regex: new RegExp(`^${phoneNumber.replace('+', '\\+')}`, 'i') } },
          ],
        };
        //633d27619abbb80ad0ec512a role id 
        companyModel.name = name
        const companyRequest = await addAndUpdate(
          this.companiesService,
          companyModel,
          options,
        );
        const result: CompaniesResponse = new CompaniesResponse(
          await this.companiesService.addCompany(companyRequest),
        );
        const userPayLoad= {
          tenantId:result.id,
          email : email,
          password:password,
          userName:firstName+" "+lastName,
          firstName:firstName,
          lastName:lastName,
          timeZone:companyModel.timeZone,
          phoneNumber:phoneNumber,
          role:"633d27619abbb80ad0ec512a",
          deviceId:"62285461da81e8f6edb90775"
  
        }
        Logger.log("UserPayload "+ userPayLoad)
        const superUser = await firstValueFrom(
          this.userService.send({ cmd: 'add_user' },userPayLoad),
        );
        Logger.log("response "+ superUser)

        const officePayload={
          name : companyName,
          address:address,
          phoneNumber:phoneNumber,
          tenantId:result.id,
          isHeadOffice:true,
          timeZone: companyModel.timeZone,
          country:country,
          state:state,
          city:companyModel.timeZone.tzCode.split('/')[1],
          isActive:true,
  
        }
        Logger.log("UserPayload "+ officePayload)
        const superOffice = await firstValueFrom(
          this.officeService.send({ cmd: 'office' },officePayload),
        );
        response.status(HttpStatus.CREATED).send({
          message: 'Company has been created successfully',
          data: result,
        });
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        } else {
          Logger.log('Error Logged in addCompany of Company Controller');
          Logger.error(error.message, error.stack);
          Logger.log(companyModel);
          throw new InternalServerErrorException('Error while creating company');
        }
      }
    }
  }
