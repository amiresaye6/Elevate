import { Test, TestingModule } from '@nestjs/testing';
import { MentorDiscoveryService } from './mentor-discovery.service';

describe('MentorDiscoveryService', () => {
  let service: MentorDiscoveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorDiscoveryService],
    }).compile();

    service = module.get<MentorDiscoveryService>(MentorDiscoveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
