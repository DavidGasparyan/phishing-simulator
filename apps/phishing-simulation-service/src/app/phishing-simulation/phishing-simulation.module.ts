import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhishingSimulationService } from './phishing-simulation.service';
import { PhishingSimulationController } from './phishing-simulation.controller';
import { PhishingAttemptSchema } from '../schemas/phishing-attempt.schema';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PhishingAttempt', schema: PhishingAttemptSchema }
    ]),
    MailModule,
  ],
  controllers: [PhishingSimulationController],
  providers: [PhishingSimulationService],
})
export class PhishingSimulationModule {}
