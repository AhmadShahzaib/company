import { HttpStatus, Put, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  COMPANIES,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { CompaniesResponse } from '../models';

export default function EditCompanyDecorators() {
  const EditCompanyDecorators: Array<CombineDecoratorType> = [
    Put(),
    SetMetadata('permissions', [COMPANIES.EDIT]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: CompaniesResponse }),
  ];

  return CombineDecorators(EditCompanyDecorators);
}
