import CompanyDocument from 'mongoDb/document/Company.document';
import { Model, Schema, FilterQuery } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { InjectModel } from '@nestjs/mongoose';
import { CompaniesRequest } from './models';
import AwsClient from './utils/config';
import { Base64 } from 'aws-sdk/clients/ecr';


@Injectable()
export class CompaniesService extends BaseService<CompanyDocument> {
  protected _model: Model<CompanyDocument>;
  bucket = 'eld-uploads';

  constructor(
    @InjectModel('Companies')
    private readonly companyModel: Model<CompanyDocument>,
    private readonly awsClient: AwsClient,

  ) {
    super();
    this._model = companyModel;
  }

  updateCompany = async (
    id: string,
    editCompanyRequestData: CompaniesRequest,
  ): Promise<CompanyDocument> => {
    try {
      return await this.companyModel.findByIdAndUpdate(
        id,
        editCompanyRequestData,
        {
          new: true,
        },
      );
    } catch (error) {
      Logger.log('Error logged in updateCompany of Company service');
      Logger.error({ message: error.message, stack: error.stack });
      Logger.log({ id, editCompanyRequestData });
      throw error;
    }
  };
  findOne = async (option:FilterQuery<CompanyDocument>): Promise<CompanyDocument> => {
    try {
      const res= await this.companyModel.findOne(option);
      return res;
    } catch (error) {
      Logger.error(error.message, error.stack);
      throw error
    }
  };

  ////
  //
  async uploadFile(fileBuffer: Base64, fileName: string, contentType: string) {
    try {
      // if (!await this.checkBucketExists(this.bucket)) {
      //   Logger.error('Bucket does not exists!');
      //   throw new BadRequestException('Bucket does not exists!');
      // }
      let response = await this.awsClient.s3Client
        .upload({
          Bucket: this.bucket,
          Body: fileBuffer,
          Key: fileName,
          ...(contentType && { ContentType: contentType }),
        })
        .promise();
      return response;
    } catch (err) {
      Logger.error('Error while uploading file', err);
      throw err;
    }
  }
  //
  //
  async getObject(objectKey: string) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: objectKey,
      };
      const data = await this.awsClient.s3Client.getObject(params).promise();
      console.log(`Data =========================== `, data);
      console.log(`Data Body =========================== `, data.Body);

      return Buffer.from(data.Body).toString('base64');
    } catch (err) {
      Logger.error('Error while uploading file', err);
      throw err;
    }
  }
  //////
  //
  //
  addCompany = async (
    data: CompaniesRequest,
  ): Promise<CompanyDocument> => {
    try {
      return await this.companyModel.create(data);
    } catch (error) {
      Logger.error(error.message, error.stack);
      throw error;
    }
  };

  findCompanyById = async (id) => {
    try {
      return await this.companyModel.findById(id, { isDeleted: false });
    } catch (error) {
      Logger.log(`Error Logged in findCompanyById of Company Service`);
      Logger.error({ message: error.message, stack: error.stack });
      Logger.log({ id });
      throw error;
    }
  };
}
