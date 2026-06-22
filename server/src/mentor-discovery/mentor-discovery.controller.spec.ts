import { Test, TestingModule } from '@nestjs/testing';
import { MentorDiscoveryController } from './mentor-discovery.controller';
import { MentorDiscoveryService } from './mentor-discovery.service';

describe('MentorDiscoveryController', () => {
  let controller: MentorDiscoveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorDiscoveryController],
      providers: [MentorDiscoveryService],
    }).compile();

    controller = module.get<MentorDiscoveryController>(
      MentorDiscoveryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
