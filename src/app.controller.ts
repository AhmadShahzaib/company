import CompanyDocument from 'mongoDb/document/Company.document';
import DemoDocument from 'mongoDb/document/Demo.document';
import { CompaniesRequest, CompaniesResponse } from './models';
import {
  searchableAtrributes,
  sortableAttributes,
  searchableIds,
} from './models';
import {
  ListingParams,
  ListingParamsValidationPipe,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
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
  Query,
  HttpStatus,
  UploadedFiles,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Response, Request } from 'express';
import EditCompanyDecorators from './decorators/update';
import EditDemoDecorators from './decorators/updateDemo';

import timezones from 'timezones-list';
import {
  BaseController,
  MessagePatternResponseInterceptor,
  MongoIdValidationPipe,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import GetCompanyDecorators from 'decorators/getCompanyProfile';
import GetDemoDecorators from 'decorators/getDemos';

import AddDecorators from 'decorators/add';
import RequestDemoDecorators from 'decorators/requestDemo';

import { FilterQuery, Types } from 'mongoose';
import { addAndUpdate } from 'shared/addAndUpdate';
import { validateDemo } from 'shared/validateDemo';

import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { uploadDocument } from './utils/upload';
import { getDocuments } from 'utils/getDocuments';

import { firstValueFrom } from 'rxjs';
@Controller('Companies')
@ApiTags('Companies')
export class CompaniesController extends BaseController {
  constructor(
    private readonly companiesService: CompaniesService,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('OFFICE_SERVICE') private readonly officeService: ClientProxy,
  ) {
    super();
  }

  @UseInterceptors(MessagePatternResponseInterceptor)
  @MessagePattern({ cmd: 'get_company_by_id' })
  async tcp_getCompanyById(id: string): Promise<CompaniesResponse | Error> {
    try {
      Logger.log(`get Company by tenantID :${id}`);
      const option = { IsActive: true };
      const company = await this.companiesService.findCompanyById(id);
      return company;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      return err;
    }
  }
  // @------------------- Edit Company API controller -------------------
  @EditCompanyDecorators()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'userDocument', maxCount: 10 },
      { name: 'profile', maxCount: 1 },
    ]),
  )
  async update(
    @Body() editCompanyRequestData: CompaniesRequest,
    @UploadedFiles()
    files: {
      userDocument: Express.Multer.File[];
      profile: Express.Multer.File;
    },
    @Res() response: Response,
    @Req() request: Request,
  ) {
    Logger.log(
      `${request.method} request received from ${request.ip} for endpoint ${
        request.originalUrl
      } by: ${request.user ?? 'Unauthorized User'}`,
    );
    try {
      const { tenantId: id } = request.user ?? ({ tenantId: undefined } as any);
      if (id) {
        const { name, email, usdot, phoneNumber } = editCompanyRequestData;
        const options: FilterQuery<CompanyDocument> = {
          $and: [{ isDeleted: false }, { _id: { $ne: id } }],
          $or: [
            { name: { $regex: new RegExp(`^${name}`, 'i') } },
            { email: { $regex: new RegExp(`^${email}`, 'i') } },
            { usdot: { $regex: new RegExp(`^${usdot}`, 'i') } },
            {
              phoneNumber: {
                $regex: new RegExp(`^${phoneNumber.replace('+', '\\+')}`, 'i'),
              },
            },
          ],
        };

        let requestModel = await uploadDocument(
          files?.userDocument,
          files?.profile,
          this.companiesService,
          editCompanyRequestData,
          id,
        );
        const companyRequest = await addAndUpdate(
          this.companiesService,
          requestModel,
          options,
        );

        const updatedCompany = await this.companiesService.updateCompany(
          id,
          companyRequest,
        );
        let result: CompaniesResponse = await getDocuments(
          updatedCompany,
          this.companiesService,
        );
        if (updatedCompany) {
          //   const result: CompaniesResponse = new CompaniesResponse(
          //     model
          //   );
          response.status(200).send({
            message: 'Company has been updated successfully',
            data: result,
          });
        } else {
          throw new NotFoundException(`${id} does not exist`);
        }
      } else {
        throw new NotFoundException(`Id not found in token.`);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      Logger.log('Error Logged in update of Company Controller');
      Logger.error({ message: error.message, stack: error.stack });
      // Logger.log({ id, ...editCompanyRequestData });
      throw new InternalServerErrorException('Error while updating Company');
    }
  }
  // @------------------- Edit Demo API controller -------------------
  @EditDemoDecorators()
  async updateDemo(
    @Body() editDemoRequestData,

    @Res() response: Response,
    @Req() request: Request,
  ) {
    Logger.log(
      `${request.method} request received from ${request.ip} for endpoint ${
        request.originalUrl
      } by: ${request.user ?? 'Unauthorized User'}`,
    );
    try {
      const { id } = editDemoRequestData;
     
      if (id) {
        const Demo = await this.companiesService.findDemoById(id);
        let companyModel: any = JSON.stringify(Demo);
        companyModel = JSON.parse(companyModel);
        if (editDemoRequestData.status == 'approved') {
          const {
            state,
            companyName,
            country,
            address,
            firstName,
            lastName,
            // password,
            email,
            usdot,
            phoneNumber,
          } = companyModel;
          let name = companyName;
          const options: FilterQuery<DemoDocument> = {
            $and: [{ isDeleted: false }],
            $or: [
              { name: { $regex: new RegExp(`^${name}`, 'i') } },
              { email: { $regex: new RegExp(`^${email}`, 'i') } },
              { usdot: { $regex: new RegExp(`^${usdot}`, 'i') } },
              { phoneNumber: { $regex: new RegExp(`^${phoneNumber}`, 'i') } },
            ],
          };
          //633d27619abbb80ad0ec512a role id
          companyModel.name = name;
          const companyRequest = await addAndUpdate(
            this.companiesService,
            companyModel,
            options,
          );
          const result: CompaniesResponse = new CompaniesResponse(
            await this.companiesService.addCompany(companyRequest),
          );
          let password = editDemoRequestData.password;
          const userPayLoad = {
            tenantId: result.id,
            email: email,
            password: password,
            userName: firstName + ' ' + lastName,
            firstName: firstName,
            lastName: lastName,
            timeZone: companyModel.timeZone,
            phoneNumber: phoneNumber,
            role: '633d27619abbb80ad0ec512a',
            deviceId: '62285461da81e8f6edb90775',
          };
          const superUser = await firstValueFrom(
            this.authService.send({ cmd: 'add_user' }, userPayLoad),
          );
          const emailSent = await firstValueFrom(
            this.userService.send({ cmd: 'send_email' }, userPayLoad),
          );
          const officePayload = {
            name: companyName,
            address: address,
            phoneNumber: phoneNumber,
            tenantId: result.id,
            isHeadOffice: true,
            timeZone: companyModel.timeZone,
            country: country,
            state: state,
            city: companyModel.timeZone.tzCode.split('/')[1],
            isActive: true,
          };
          const superOffice = await firstValueFrom(
            this.officeService.send({ cmd: 'office' }, officePayload),
          );
          response.status(HttpStatus.CREATED).send({
            message: 'Company has been created successfully',
            data: result,
          });
        } else if (editDemoRequestData.status != 'approved') {
          const updatedDemo = await this.companiesService.updateDemo(
            id,
            editDemoRequestData,
          );
          response.status(HttpStatus.CREATED).send({
            message: 'Demo  has been updated successfully',
            data: updatedDemo,
          });
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      Logger.log('Error Logged in update of Company Controller');
      Logger.error({ message: error.message, stack: error.stack });
      // Logger.log({ id, ...editCompanyRequestData });
      throw new InternalServerErrorException('Error while updating Company');
    }
  }
  @GetCompanyDecorators()
  async getCompanyProfile(@Req() request: Request) {
    Logger.log(
      `${request.method} request received from ${request.ip} for ${
        request.originalUrl
      } by: ${request.user ?? 'Unauthorized User'}`,
    );
    const { tenantId: id } = request.user ?? ({ tenantId: undefined } as any);
    try {
      if (id) {
        const company = await this.companiesService.findCompanyById(id);
        if (company) {
          const companyResp: CompaniesResponse = new CompaniesResponse(company);
          let result: CompaniesResponse = await getDocuments(
            companyResp,
            this.companiesService,
          );

          return {
            message: 'Company Found',
            data: result,
          };
        } else {
          throw new NotFoundException(`No company found with the id ${id}`);
        }
      } else {
        throw new NotFoundException(`No tenant Id found.`);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      Logger.log('Error Logged in update of Company Controller');
      Logger.error({ message: error.message, stack: error.stack });
      Logger.log({ id });
      throw new InternalServerErrorException('Error while updating Company');
    }
  }

  @GetDemoDecorators()
  async getAlldemo(
    @Query(new ListingParamsValidationPipe()) queryParams: ListingParams,
    @Req() request: Request,
  ) {
    Logger.log(
      `${request.method} request received from ${request.ip} for ${
        request.originalUrl
      } by: ${request.user ?? 'Unauthorized User'}`,
    );
    let { search, orderBy, orderType, pageNo, limit } = queryParams;
    const { tenantId: id } = request.user ?? ({ tenantId: undefined } as any);
    try {
      const options: FilterQuery<DemoDocument> = {};

      if (search) {
        options['$or'] = [];
        if (Types.ObjectId.isValid(search)) {
          searchableIds.forEach((attribute) => {
            options['$or'].push({ [attribute]: new RegExp(search, 'i') });
          });
        }
        searchableAtrributes.forEach((attribute) => {
          options['$or'].push({ [attribute]: new RegExp(search, 'i') });
        });
      }
      const query = await this.companiesService.getDemos(options, queryParams);
      // if (orderBy && sortableAttributes.includes(orderBy)) {
      //   query.collation({ locale: 'en' }).sort({ [orderBy]: orderType ?? 1 });
      // } else {
      //   query.sort();
      // }

      let total = Object.keys(query).length;
      return {
        message: 'Company Found',
        data: query,
        total,
        pageNo: pageNo ?? 1,
        last_page: Math.ceil(
          total /
            (limit && limit.toString().toLowerCase() === 'all'
              ? total
              : limit ?? 10),
        ),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      Logger.log('Error Logged in update of Company Controller');
      Logger.error({ message: error.message, stack: error.stack });
      Logger.log({ id });
      throw new InternalServerErrorException('Error while updating Company');
    }
  }
  @RequestDemoDecorators()
  async requestDemo(@Body() requestModel, @Res() response: Response) {
    try {
      const {
        state,
        companyName,
        country,
        address,
        firstName,
        lastName,
        password,
        userDetails,
        email,
        usdot,
        phoneNumber,
      } = requestModel;
      let name = companyName;
      const options: FilterQuery<DemoDocument> = {
        $and: [{ isDeleted: false }],
        $or: [
          { name: { $regex: new RegExp(`^${name}`, 'i') } },
          { email: { $regex: new RegExp(`^${email}`, 'i') } },
          { usdot: { $regex: new RegExp(`^${usdot}`, 'i') } },
          { phoneNumber: { $regex: new RegExp(`^${phoneNumber}`, 'i') } },
        ],
      };
      //633d27619abbb80ad0ec512a role id
      requestModel.name = name;
      const companyRequest = await validateDemo(
        this.companiesService,
        requestModel,
        options,
      );
      const result = await this.companiesService.addDemo(companyRequest);

      response.status(HttpStatus.CREATED).send({
        message: 'Demo Request has been created successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        Logger.log('Error Logged in addCompany of Company Controller');
        Logger.error(error.message, error.stack);
        Logger.log(requestModel);
        throw new InternalServerErrorException('Error while creating company');
      }
    }
  }

  //not functional
  @AddDecorators()
  async addUsers(@Body() companyModel, @Res() response: Response) {
    try {
      const {
        state,
        companyName,
        country,
        address,
        firstName,
        lastName,
        password,
        email,
        usdot,
        phoneNumber,
      } = companyModel;
      let name = companyName;
      const options: FilterQuery<DemoDocument> = {
        $and: [{ isDeleted: false }],
        $or: [
          { name: { $regex: new RegExp(`^${name}`, 'i') } },
          { email: { $regex: new RegExp(`^${email}`, 'i') } },
          { usdot: { $regex: new RegExp(`^${usdot}`, 'i') } },
          { phoneNumber: { $regex: new RegExp(`^${phoneNumber}`, 'i') } },
        ],
      };
      //633d27619abbb80ad0ec512a role id
      companyModel.name = name;
      const companyRequest = await addAndUpdate(
        this.companiesService,
        companyModel,
        options,
      );
      const result: CompaniesResponse = new CompaniesResponse(
        await this.companiesService.addCompany(companyRequest),
      );
      const userPayLoad = {
        tenantId: result.id,
        email: email,
        password: password,
        userName: firstName + ' ' + lastName,
        firstName: firstName,
        lastName: lastName,
        timeZone: companyModel.timeZone,
        phoneNumber: phoneNumber,
        role: '633d27619abbb80ad0ec512a',
        deviceId: '62285461da81e8f6edb90775',
      };
      const superUser = await firstValueFrom(
        this.userService.send({ cmd: 'add_user' }, userPayLoad),
      );
      const officePayload = {
        name: companyName,
        address: address,
        phoneNumber: phoneNumber,
        tenantId: result.id,
        isHeadOffice: true,
        timeZone: companyModel.timeZone,
        country: country,
        state: state,
        city: companyModel.timeZone.tzCode.split('/')[1],
        isActive: true,
      };
      const superOffice = await firstValueFrom(
        this.officeService.send({ cmd: 'office' }, officePayload),
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
