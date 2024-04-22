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
  UploadedFiles,
  UseInterceptors,
  Inject,
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import GetCompanyDecorators from 'decorators/getCompanyProfile';
import AddDecorators from 'decorators/add';
import { FilterQuery } from 'mongoose';
import { addAndUpdate } from 'shared/addAndUpdate';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { uploadDocument } from './utils/upload';
import { firstValueFrom } from 'rxjs';
@Controller('Companies')
@ApiTags('Companies')
export class CompaniesController extends BaseController {
  constructor(
    private readonly companiesService: CompaniesService,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
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
          editCompanyRequestData,
          options,
        );

        const updatedCompany = await this.companiesService.updateCompany(
          id,
          companyRequest,
        );
        if (updatedCompany) {
          const result: CompaniesResponse = new CompaniesResponse(
            updatedCompany,
          );
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
          return {
            message: 'Company Found',
            data: companyResp,
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
      const options: FilterQuery<CompanyDocument> = {
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
