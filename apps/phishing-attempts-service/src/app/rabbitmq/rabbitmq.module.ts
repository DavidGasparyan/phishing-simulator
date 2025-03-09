import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitmqController } from './rabbitmq.controller';
import { PhishingAttemptSchema } from '../schemas/phishing-attempt.schema';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PhishingAttempt', schema: PhishingAttemptSchema }
    ]),
    WebsocketModule,
  ],
  controllers: [RabbitmqController],
})
export class RabbitmqModule {}
