import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PhishingAttemptsService } from './phishing-attempts.service';
import { PhishingAttemptsController } from './phishing-attempts.controller';
import { PhishingAttemptSchema } from '../schemas/phishing-attempt.schema';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PhishingAttempt', schema: PhishingAttemptSchema }
    ]),
    AuthModule,
    WebsocketModule,
  ],
  controllers: [PhishingAttemptsController],
  providers: [PhishingAttemptsService],
})
export class PhishingAttemptsModule {}
