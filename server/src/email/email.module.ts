import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { QueueService } from './queue.service';
import { EmailWorker } from './email.worker';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMqService } from './rabbitmq.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [EmailService, QueueService, EmailWorker, RabbitMqService],
  exports: [EmailService, QueueService, RabbitMqService],
})
export class EmailModule {}
