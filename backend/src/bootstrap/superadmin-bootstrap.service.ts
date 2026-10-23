import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SuperadminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperadminBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const adminCount = await this.prisma.users.count({
      where: { role: 'admin' },
    });

    if (adminCount > 0) {
      this.logger.log(
        'An admin account already exists; skipping superadmin bootstrap.',
      );
      return;
    }

    const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.SUPERADMIN_PASSWORD;
    const passwordHash = process.env.SUPERADMIN_PASSWORD_HASH;

    if (!email) {
      this.logger.warn(
        'SUPERADMIN_EMAIL is not set; skipping superadmin bootstrap.',
      );
      return;
    }

    if (!password && !passwordHash) {
      this.logger.warn(
        'SUPERADMIN_PASSWORD or SUPERADMIN_PASSWORD_HASH is not set; skipping superadmin bootstrap.',
      );
      return;
    }

    if (passwordHash && !passwordHash.startsWith('$2')) {
      this.logger.error(
        'SUPERADMIN_PASSWORD_HASH is not a valid bcrypt hash; superadmin was not created.',
      );
      return;
    }

    if (!passwordHash && password && password.length < 12) {
      this.logger.error(
        'SUPERADMIN_PASSWORD must be at least 12 characters; superadmin was not created.',
      );
      return;
    }

    const hash = passwordHash ?? (await bcrypt.hash(password ?? '', 12));

    try {
      const user = await this.prisma.users.create({
        data: {
          email,
          password_hash: hash,
          role: 'admin',
          is_active: true,
        },
        select: { id: true, email: true },
      });

      this.logger.log(`Superadmin created: ${user.email}`);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        this.logger.warn(
          `A user with email ${email} already exists; superadmin was not created.`,
        );
        return;
      }
      throw error;
    }
  }
}
