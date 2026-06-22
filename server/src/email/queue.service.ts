import { Injectable, Logger } from '@nestjs/common';
import { RabbitMqService } from './rabbitmq.service';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(private readonly rabbitMq: RabbitMqService) {}

  async queueEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<boolean> {
    try {
      const queueName = process.env.EMAIL_QUEUE_NAME || 'email_queue';
      await this.rabbitMq.publishToQueue(queueName, { to, subject, body });
      this.logger.log(
        `Queued email successfully to ${to} | Subject: ${subject}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to queue email to ${to}:`, error);
      return false;
    }
  }
}
