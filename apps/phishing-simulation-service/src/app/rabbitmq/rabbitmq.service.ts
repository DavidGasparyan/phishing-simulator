import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject('PHISHING_SIMULATION_SERVICE') private client: ClientProxy
  ) {}

  async publishLinkClicked(attemptId: string): Promise<void> {
    try {
      this.logger.log(`Publishing phishing.link.clicked event for attempt: ${attemptId}`);

      await firstValueFrom(
        this.client.emit('phishing.link.clicked', {
          attemptId,
          timestamp: new Date().toISOString(),
        })
      );

      this.logger.log('Event published successfully');
    } catch (error) {
      this.logger.error(`Error publishing link clicked event: ${error.message}`);
      throw error;
    }
  }
}
