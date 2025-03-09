import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePhishingAttemptDto, PhishingAttempt } from '@phishing-simulator/shared-types';
import { MailService } from '../mail/mail.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class PhishingSimulationService {
  private readonly logger: Logger = new Logger(PhishingSimulationService.name);

  constructor(
    @InjectModel('PhishingAttempt') private phishingAttemptModel: Model<PhishingAttempt>,
    private readonly mailService: MailService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async createPhishingAttempt(
    createPhishingAttemptDto: CreatePhishingAttemptDto
  ): Promise<PhishingAttempt> {
    try {
      const trackingToken = this.generateTrackingToken();

      const phishingAttempt = new this.phishingAttemptModel({
        recipientEmail: createPhishingAttemptDto.recipientEmail,
        emailContent: createPhishingAttemptDto.emailTemplate,
        status: 'PENDING',
        trackingToken,
      });

      const savedAttempt = await phishingAttempt.save();

      this.websocketGateway.notifyPhishingAttemptUpdate(savedAttempt);

      await this.mailService.sendPhishingEmail({
        to: createPhishingAttemptDto.recipientEmail,
        subject: 'Important Security Update',
        trackingToken,
        emailTemplate: createPhishingAttemptDto.emailTemplate,
      });

      return savedAttempt;
    } catch (error) {
      this.logger.error('Failed to create phishing attempt', error);
      throw new BadRequestException('Could not create phishing attempt');
    }
  }

  async trackPhishingAttempt(trackingToken: string): Promise<PhishingAttempt> {
    const phishingAttempt = await this.phishingAttemptModel.findOne({ trackingToken });

    if (!phishingAttempt) {
      throw new BadRequestException('Invalid tracking token');
    }

    const previousStatus = phishingAttempt.status;
    phishingAttempt.status = 'CLICKED';
    phishingAttempt.clickedAt = new Date();

    const updatedAttempt = await phishingAttempt.save();

    this.websocketGateway.notifyPhishingAttemptUpdate(updatedAttempt);
    this.websocketGateway.notifyPhishingAttemptStatusChange(updatedAttempt, previousStatus);

    return updatedAttempt;
  }

  private generateTrackingToken(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
}
