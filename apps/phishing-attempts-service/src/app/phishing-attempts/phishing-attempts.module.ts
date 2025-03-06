import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PhishingAttemptsService } from './phishing-attempts.service';
import { PhishingAttemptsController } from './phishing-attempts.controller';
import { PhishingAttemptSchema } from '../schemas/phishing-attempt.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/phishing-simulator'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'PhishingAttempt', schema: PhishingAttemptSchema }
    ]),
    AuthModule,
  ],
  controllers: [PhishingAttemptsController],
  providers: [PhishingAttemptsService],
})
export class PhishingAttemptsModule {}
