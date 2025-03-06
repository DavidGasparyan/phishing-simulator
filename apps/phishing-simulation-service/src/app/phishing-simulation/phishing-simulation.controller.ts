import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PhishingSimulationService } from './phishing-simulation.service';
import { CreatePhishingAttemptDto } from '@phishing-simulator/shared-types';

@Controller('phishing')
export class PhishingSimulationController {
  constructor(
    private readonly phishingSimulationService: PhishingSimulationService
  ) {}

  @Post('/send')
  async createPhishingAttempt(
    @Body() createPhishingAttemptDto: CreatePhishingAttemptDto,
  ) {
    return this.phishingSimulationService.createPhishingAttempt(
      createPhishingAttemptDto
    );
  }

  @Get('/track/:token')
  async trackPhishingAttempt(@Param('token') token: string) {
    return this.phishingSimulationService.trackPhishingAttempt(token);
  }
}
