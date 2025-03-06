import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhishingAttemptsModule } from './phishing-attempts/phishing-attempts.module';

@Module({
  imports: [PhishingAttemptsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
