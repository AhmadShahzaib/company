import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  GetOperationId,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { CompaniesResponse } from '../models/companyResponse.model';

export default function RequestDemoDecorators() {
  const RequestDemoDecorators: Array<CombineDecoratorType> = [
    Post('requestDemo'),
    // ApiBearerAuth("access-token"),
    ApiResponse({ status: HttpStatus.CREATED, type: CompaniesResponse }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      type: ForbiddenException,
      description:
        'Either the token does not exist or the token was compromised',
    }),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ConflictException }),
    ApiOperation(GetOperationId('Companies', 'Add')),
  ];
  return CombineDecorators(RequestDemoDecorators);
}
