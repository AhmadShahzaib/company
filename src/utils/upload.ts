import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { CompaniesRequest, CompaniesResponse } from '../models';

import { CompaniesService } from '../app.service';

import moment from 'moment';
import { Logger } from '@nestjs/common';

export const uploadDocument = async (
  doc: any,
  profile: Express.Multer.File,
  appService: CompaniesService,
  companyModel: CompaniesRequest ,
  tenantId: string,
) => {
  if (doc && doc.length > 0) {
    companyModel.documents = [];
    doc?.forEach(async (item) => {
      let key = await appService.uploadFile(
        item?.buffer,
        `${tenantId}/${companyModel.email}/companyDocuments/${moment().unix()}-${
          item?.originalname
        }`,
        item.mimetype,
      );
      companyModel.documents.push({
        key: key.key,
        name: item?.originalname,
        date: moment().unix(),
      });
    });
  }
  if (profile) {
    // Logger.log(`Validation completed with no errors or conflicts.`);

    let keyProfile = await appService.uploadFile(
      profile[0]?.buffer,
      `${tenantId}/${companyModel.email}/companyDocuments/${moment().unix()}-${
        profile[0]?.originalname
      }`,
      profile[0].mimetype,
    );
    companyModel.companyProfile = {
      key: keyProfile.key,
      name: profile[0]?.originalname,
      date: moment().unix(),
    };
  }
  return companyModel;
};
