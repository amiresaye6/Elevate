import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMqService } from './rabbitmq.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailWorker implements OnModuleInit {
  private readonly logger = new Logger(EmailWorker.name);

  constructor(
    private readonly rabbitMq: RabbitMqService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting Email RabbitMQ Worker...');
    try {
      const channel = await this.rabbitMq.getChannel();
      const queueName = process.env.EMAIL_QUEUE_NAME || 'email_queue';

      await channel.prefetch(1);

      channel.consume(
        queueName,
        async (msg) => {
          if (msg !== null) {
            try {
              const emailData = JSON.parse(msg.content.toString());
              this.logger.log(`📬 Received email job to: ${emailData.to}`);

              await this.emailService.sendMail(
                emailData.to,
                emailData.subject,
                emailData.body,
              );

              channel.ack(msg);
              this.logger.log('✅ Job completed and acknowledged');
            } catch (error: any) {
              this.logger.error('❌ Error processing email job:', error.message || error);
              // Requeue the message for retry
              channel.nack(msg, false, true);
              this.logger.warn('⚠️ Job rejected and requeued for retry');
            }
          }
        },
        { noAck: false },
      );

      this.logger.log(`✅ Email Worker listening on queue: ${queueName}`);
    } catch (error) {
      this.logger.error('❌ Failed to start Email Worker:', error);
    }
  }
}

