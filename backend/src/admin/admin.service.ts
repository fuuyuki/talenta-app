import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

const ROLES = ['admin', 'mentor', 'mentee'] as const;
export type AdminRole = (typeof ROLES)[number];

export type CreateUserInput = {
  email?: string;
  password?: string;
  role?: string;
  full_name?: string;
};

export type UpdateUserInput = {
  role?: string;
  is_active?: boolean;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRole(value: string): value is AdminRole {
  return (ROLES as readonly string[]).includes(value);
}

function assertUuid(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new BadRequestException('Invalid user id');
  }
}

function assertPassword(password: string | undefined): string {
  if (!password) {
    throw new BadRequestException('Password is required');
  }
  if (password.length < 12) {
    throw new BadRequestException('Password must be at least 12 characters');
  }
  return password;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    role: true,
    is_active: true,
    created_at: true,
    member_profiles: {
      select: { full_name: true },
    },
  } as const;

  async listUsers(input: { search?: string; role?: string }) {
    const search = input.search?.trim();
    const role = input.role?.trim();

    if (role && !isRole(role)) {
      throw new BadRequestException('Invalid role');
    }

    const where = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              {
                email: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                member_profiles: {
                  is: {
                    full_name: {
                      contains: search,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    return this.prisma.users.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100,
      select: this.userSelect,
    });
  }

  async createUser(input: CreateUserInput) {
    const email = input.email?.trim().toLowerCase() ?? '';

    if (!email) {
      throw new BadRequestException('Email is required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Invalid email address');
    }

    const password = assertPassword(input.password);
    const role = input.role ?? 'mentee';

    if (!isRole(role)) {
      throw new BadRequestException('Invalid role');
    }

    const fullName = input.full_name?.trim();

    const existing = await this.prisma.users.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    return this.prisma.users.create({
      data: {
        email,
        password_hash: passwordHash,
        role,
        ...(fullName
          ? { member_profiles: { create: { full_name: fullName } } }
          : {}),
      },
      select: this.userSelect,
    });
  }

  async updateUser(id: string, input: UpdateUserInput) {
    assertUuid(id);

    const user = await this.prisma.users.findUnique({
      where: { id },
      select: { id: true, role: true, is_active: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: { role?: AdminRole; is_active?: boolean } = {};

    if (input.role !== undefined) {
      if (!isRole(input.role)) {
        throw new BadRequestException('Invalid role');
      }
      data.role = input.role;
    }

    if (input.is_active !== undefined) {
      if (typeof input.is_active !== 'boolean') {
        throw new BadRequestException('is_active must be a boolean');
      }
      data.is_active = input.is_active;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No changes provided');
    }

    const removesActiveAdmin =
      user.role === 'admin' &&
      user.is_active &&
      ((data.role !== undefined && data.role !== 'admin') ||
        data.is_active === false);

    if (removesActiveAdmin) {
      const otherAdmins = await this.prisma.users.count({
        where: {
          role: 'admin',
          is_active: true,
          NOT: { id },
        },
      });

      if (otherAdmins === 0) {
        throw new BadRequestException('Cannot remove the last active admin');
      }
    }

    return this.prisma.users.update({
      where: { id },
      data,
      select: this.userSelect,
    });
  }

  async resetPassword(id: string, password: string | undefined) {
    assertUuid(id);

    const user = await this.prisma.users.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validPassword = assertPassword(password);
    const passwordHash = await bcrypt.hash(validPassword, 12);

    await this.prisma.users.update({
      where: { id },
      data: { password_hash: passwordHash },
    });

    return { message: 'Password updated successfully' };
  }
}
