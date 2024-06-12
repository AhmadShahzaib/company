import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { CompaniesRequest, CompaniesResponse } from '../models';

import { CompaniesService } from '../app.service';

export const getDocuments = async (
  company: CompaniesResponse,
  appService: CompaniesService,
): Promise<CompaniesResponse> => {
  if (company?.companyProfile?.key) {
    let newcompany: any = JSON.stringify(company);
    newcompany = JSON.parse(newcompany);
    const url = await appService.getObject(newcompany.companyProfile.key);
    newcompany.companyProfile.imagePath = `data:image/${newcompany.companyProfile.name
      .split('.')
      .pop()};base64,${url.replace(/\s+/g, '')}`;
    delete newcompany.companyProfile.key;
    company = newcompany
  } else if (!company?.companyProfile) {
    //   let newcompany: any = JSON.stringify(company);
    //   if (newcompany?.companyProfile?.key) {
    //     let url = await appService.getObject(company.companyProfile.key);
    //     company.companyProfile['imagePath'] = `data:image/${company.companyProfile.name
    //       .split('.')
    //       .pop()};base64,${url.replace(/\s+/g, '')}`;
    //     delete company.companyProfile['key'];
    // }
  }
  return company;
};
