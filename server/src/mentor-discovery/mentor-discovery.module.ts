import { Module } from '@nestjs/common';
import { MentorDiscoveryService } from './mentor-discovery.service';
import { MentorDiscoveryController } from './mentor-discovery.controller';

@Module({
  controllers: [MentorDiscoveryController],
  providers: [MentorDiscoveryService],
})
export class MentorDiscoveryModule {}
