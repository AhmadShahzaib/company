import { Get, HttpStatus, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  COMPANIES,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { CompaniesResponse } from 'models';

export default function GetDemoDecorators() {
  const GetDemoDecorators: Array<CombineDecoratorType> = [
    Get('getDemos'),
    // SetMetadata('permissions', [COMPANIES.GETBYID]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: CompaniesResponse }),
  ];

  return CombineDecorators(GetDemoDecorators);
}
