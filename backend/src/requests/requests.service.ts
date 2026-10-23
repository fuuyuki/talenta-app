import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async submitRequest(data: { full_name: string; email: string; phone?: string; reason?: string }) {
    const existing = await this.prisma.registration_requests.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('A request with this email already exists.');

    return this.prisma.registration_requests.create({ data });
  }
}
