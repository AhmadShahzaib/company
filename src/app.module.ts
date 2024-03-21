import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesService } from './app.service';
import { ConfigurationService, SharedModule } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { CompanySchema } from './mongoDb/schema/Company.schema';
import { CompaniesController } from './app.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { addController } from 'company.controller';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigurationService) => ({
        uri: configService.mongoUri,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigurationService],
    }),
    MongooseModule.forFeature([
      { name: 'Companies', schema: CompanySchema },
    ]),
  ],
  controllers: [CompaniesController,addController],
  providers: [ConfigurationService, CompaniesService, {
    provide: 'USER_SERVICE',
    useFactory: (config: ConfigurationService) => {
      const inspectServicePort = config.get('USER_MICROSERVICE_PORT');
      const inspectServiceHost = config.get('USER_MICROSERVICE_HOST');

      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          port: Number(inspectServicePort),
          host: inspectServiceHost,
        },
      });
    },
    inject: [ConfigurationService],
  },
  {
    provide: 'OFFICE_SERVICE',
    useFactory: (config: ConfigurationService) => {
      const inspectServicePort = config.get('OFFICE_MICROSERVICE_PORT');
      const inspectServiceHost = config.get('OFFICE_MICROSERVICE_HOST');

      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          port: Number(inspectServicePort),
          host: inspectServiceHost,
        },
      });
    },
    inject: [ConfigurationService],
  },
],
})

export class AppModule {
  static port: number | string;
  static isDev: boolean;

  constructor(private readonly _configurationService: ConfigurationService) {
    AppModule.port = AppModule.normalizePort(_configurationService.port);
    AppModule.isDev = _configurationService.isDevelopment;
  }

  /**
   * Normalize port or return an error if port is not valid
   * @param val The port to normalize
   */
  private static normalizePort(val: number | string): number | string {
    const port: number = typeof val === 'string' ? parseInt(val, 10) : val;

    if (Number.isNaN(port)) {
      return val;
    }

    if (port >= 0) {
      return port;
    }

    throw new Error(`Port "${val}" is invalid.`);
  }
}
