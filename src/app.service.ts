import CompanyDocument from 'mongoDb/document/Company.document';
import { Model, Schema, FilterQuery } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { InjectModel } from '@nestjs/mongoose';
import { CompaniesRequest } from './models';

@Injectable()
export class CompaniesService extends BaseService<CompanyDocument> {
  protected _model: Model<CompanyDocument>;
  constructor(
    @InjectModel('Companies')
    private readonly companyModel: Model<CompanyDocument>,
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
