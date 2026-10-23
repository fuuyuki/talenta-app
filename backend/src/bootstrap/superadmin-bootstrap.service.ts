import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SuperadminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperadminBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const adminCount = await this.countAdmins();

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
          is_active: true,
          user_roles: {
            create: [{ roles: { connect: { code: 'admin' } } }],
          },
        },
        select: { id: true, email: true },
      });

      this.logger.log(`Superadmin created: ${user.email}`);
    } catch (error) {
      const code = (error as { code?: string }).code;

      if (code === 'P2002') {
        this.logger.warn(
          `A user with email ${email} already exists; superadmin was not created.`,
        );
        return;
      }

      if (code === 'P2025') {
        this.logger.error(
          'The admin role is missing from the roles table. Re-initialise the database from db/init/01_schema.sql.',
        );
        return;
      }

      throw error;
    }
  }

  /**
   * Counts admin accounts, turning a missing `user_roles` / `roles` table into
   * an actionable message instead of a cryptic Prisma error at startup.
   */
  private async countAdmins(): Promise<number> {
    try {
      return await this.prisma.user_roles.count({
        where: { roles: { is: { code: 'admin' } } },
      });
    } catch (error) {
      const code = (error as { code?: string }).code;

      if (code === 'P2021') {
        this.logger.error(
          'Database is not initialised: the roles/user_roles tables are missing. ' +
            'Create the database from db/init/01_schema.sql.',
        );
        throw new Error('Database schema is not initialised (roles tables missing)');
      }

      throw error;
    }
  }
}
