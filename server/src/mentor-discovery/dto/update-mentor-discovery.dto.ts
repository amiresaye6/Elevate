import { PartialType } from '@nestjs/mapped-types';
import { CreateMentorDiscoveryDto } from './create-mentor-discovery.dto';

export class UpdateMentorDiscoveryDto extends PartialType(CreateMentorDiscoveryDto) {}
