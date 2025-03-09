import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhishingAttemptsModule } from './phishing-attempts/phishing-attempts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://mongo:mongo@localhost:27017/phishing-simulator?authSource=admin'),
        authSource: 'admin',
        auth: {
          username: configService.get<string>('MONGODB_USERNAME', 'mongo'),
          password: configService.get<string>('MONGODB_PASSWORD', 'mongo'),
        },
      }),
      inject: [ConfigService],
    }),
    PhishingAttemptsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
