import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StacksService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.stack.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

