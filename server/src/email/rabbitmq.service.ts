import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private async connect() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      const queueName = process.env.EMAIL_QUEUE_NAME || 'email_queue';
      await this.channel.assertQueue(queueName, { durable: true });

      this.logger.log('✅ Connected to RabbitMQ successfully');

      this.connection.on('error', (err: any) => {
        this.logger.error('❌ RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('⚠️ RabbitMQ connection closed');
      });
    } catch (error) {
      this.logger.error('❌ Failed to connect to RabbitMQ:', error);
    }
  }


  async getChannel(): Promise<amqp.Channel> {
    if (!this.channel) {
      await this.connect();
    }
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }
    return this.channel;
  }

  async publishToQueue(queueName: string, message: any) {
    try {
      const ch = await this.getChannel();
      const messageBuffer = Buffer.from(JSON.stringify(message));
      ch.sendToQueue(queueName, messageBuffer, { persistent: true });
      this.logger.log(`📤 Message published to queue: ${queueName}`);
    } catch (error) {
      this.logger.error('❌ Failed to publish message:', error);
      throw error;
    }
  }

  async closeConnection() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('✅ RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('❌ Error closing RabbitMQ connection:', error);
    }
  }
}
