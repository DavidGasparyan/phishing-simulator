import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { PhishingAttempt } from '@phishing-simulator/shared-types';

@Controller()
export class RabbitmqController {
  private readonly logger = new Logger(RabbitmqController.name);

  constructor(
    @InjectModel('PhishingAttempt')
    private phishingAttemptModel: Model<PhishingAttempt>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  @EventPattern('phishing.link.clicked')
  async handlePhishingLinkClicked(
    @Payload() data: { attemptId: string; timestamp: string },
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`Processing phishing.link.clicked event: ${JSON.stringify(data)}`);

    try {
      const { attemptId, timestamp } = data;

      console.log(data);

      // Find the phishing attempt
      const attempt = await this.phishingAttemptModel.findById(attemptId);
      if (!attempt) {
        this.logger.warn(`Phishing attempt not found: ${attemptId}`);
        // Acknowledge anyway since we can't process it
        channel.ack(originalMsg);
        return;
      }

      // Store the previous status for event notification
      const previousStatus = attempt.status;

      // Update status and clicked timestamp
      attempt.status = 'CLICKED';
      attempt.clickedAt = new Date(timestamp || Date.now());
      await attempt.save();

      this.logger.log(`Updated phishing attempt status: ${attemptId} -> CLICKED`);

      console.log(attempt);
      // Notify all connected clients via websocket
      this.websocketGateway.notifyPhishingAttemptUpdate(attempt);
      this.websocketGateway.notifyPhishingAttemptStatusChange(attempt, previousStatus);

      // Acknowledge the message
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error processing phishing.link.clicked event: ${error.message}`);
      // Reject the message and requeue
      channel.nack(originalMsg, false, true);
    }
  }
}
