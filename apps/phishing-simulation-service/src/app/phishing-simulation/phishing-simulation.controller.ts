import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PhishingSimulationService } from './phishing-simulation.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CreatePhishingEmailDto } from './create-phising-email.dto';

@Controller('phishing')
export class PhishingSimulationController {
  private readonly logger = new Logger(PhishingSimulationController.name);

  constructor(
    private readonly phishingSimulationService: PhishingSimulationService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @Post('/send')
  async sendPhishingEmail(@Body() createPhishingEmailDto: CreatePhishingEmailDto) {
    this.logger.log(`Sending phishing email to: ${createPhishingEmailDto.recipientEmail}`);
    return this.phishingSimulationService.sendPhishingEmail(createPhishingEmailDto);
  }

  @Get('/track/:token')
  async trackPhishingClick(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    try {
      if (!token) {
        throw new BadRequestException('Token is required');
      }

      this.logger.log(`Phishing link clicked with token: ${token}`);

      // Validate and decode the token
      const attemptId = await this.phishingSimulationService.validateTrackingToken(token);

      if (!attemptId) {
        throw new NotFoundException('Invalid or expired tracking link');
      }

      // Publish the link clicked event to RabbitMQ
      await this.rabbitMQService.publishLinkClicked(attemptId);

      // Return a transparent tracking pixel
      res.set('Content-Type', 'image/gif');
      res.send(Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64'));

    } catch (error) {
      this.logger.error(`Error tracking phishing click: ${error.message}`, error.stack);

      // Don't expose error details to the end user
      // Just return the tracking pixel anyway to avoid suspicion
      res.set('Content-Type', 'image/gif');
      res.send(Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64'));
    }
  }
}
