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
  roles?: string[];
  /** Convenience: create a new member record together with the account. */
  full_name?: string;
  /** Link the account to an existing member (that has no account yet). */
  member_id?: string;
};

export type UpdateUserInput = {
  roles?: string[];
  is_active?: boolean;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type UserWithRoles = { user_roles: Array<{ roles: { code: string } }> };

function isRole(value: string): value is AdminRole {
  return (ROLES as readonly string[]).includes(value);
}

function normalizeRoles(input: string[] | undefined): AdminRole[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new BadRequestException('At least one role is required');
  }

  const unique = Array.from(new Set(input.map((value) => value.trim())));

  for (const value of unique) {
    if (!isRole(value)) {
      throw new BadRequestException('Invalid role');
    }
  }

  return unique as AdminRole[];
}

function assertUuid(id: string, label = 'user') {
  if (!UUID_PATTERN.test(id)) {
    throw new BadRequestException(`Invalid ${label} id`);
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
    is_active: true,
    created_at: true,
    member: {
      select: { id: true, full_name: true },
    },
    user_roles: {
      select: { roles: { select: { code: true } } },
    },
  } as const;

  private withRoles<T extends UserWithRoles>(user: T) {
    const { user_roles, ...rest } = user;
    return { ...rest, roles: user_roles.map((item) => item.roles.code) };
  }

  async listUsers(input: { search?: string; role?: string }) {
    const search = input.search?.trim();
    const role = input.role?.trim();

    if (role && !isRole(role)) {
      throw new BadRequestException('Invalid role');
    }

    const where = {
      ...(role
        ? { user_roles: { some: { roles: { is: { code: role } } } } }
        : {}),
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
                member: {
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

    const users = await this.prisma.users.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100,
      select: this.userSelect,
    });

    return users.map((user) => this.withRoles(user));
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
    const roles = normalizeRoles(input.roles ?? ['mentee']);
    const fullName = input.full_name?.trim();
    const memberId = input.member_id?.trim();

    if (fullName && memberId) {
      throw new BadRequestException(
        'Provide either member_id or full_name, not both',
      );
    }

    if (memberId) {
      assertUuid(memberId, 'member');

      const member = await this.prisma.members.findUnique({
        where: { id: memberId },
        select: { id: true, user_id: true },
      });
      if (!member) {
        throw new NotFoundException('Member not found');
      }
      if (member.user_id) {
        throw new ConflictException('Member already has an account');
      }
    }

    const existing = await this.prisma.users.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    // If the roster already has this person, link the account to that member
    // instead of creating a duplicate member record.
    let linkedMemberId = memberId;
    if (!linkedMemberId && fullName) {
      const existingMember = await this.prisma.members.findUnique({
        where: { email },
        select: { id: true, user_id: true },
      });

      if (existingMember) {
        if (existingMember.user_id) {
          throw new ConflictException('Email already exists');
        }
        linkedMemberId = existingMember.id;
      }
    }

    const roleRecords = await this.prisma.roles.findMany({
      where: { code: { in: roles } },
      select: { id: true },
    });
    if (roleRecords.length !== roles.length) {
      throw new BadRequestException('Invalid role');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const user = await this.prisma.users.create({
        data: {
          email,
          password_hash: passwordHash,
          ...(linkedMemberId
            ? { member: { connect: { id: linkedMemberId } } }
            : fullName
              ? { member: { create: { full_name: fullName, email } } }
              : {}),
          user_roles: {
            create: roleRecords.map((record) => ({ role_id: record.id })),
          },
        },
        select: this.userSelect,
      });

      return this.withRoles(user);
    } catch (error) {
      // A member (or account) with the same email may already exist.
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async updateUser(id: string, input: UpdateUserInput) {
    assertUuid(id);

    if (input.roles === undefined && input.is_active === undefined) {
      throw new BadRequestException('No changes provided');
    }

    if (input.is_active !== undefined && typeof input.is_active !== 'boolean') {
      throw new BadRequestException('is_active must be a boolean');
    }

    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        is_active: true,
        user_roles: {
          select: { roles: { select: { code: true } } },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentRoles = user.user_roles.map((item) => item.roles.code);
    const nextRoles =
      input.roles !== undefined ? normalizeRoles(input.roles) : undefined;

    const losesAdmin =
      user.is_active &&
      currentRoles.includes('admin') &&
      ((nextRoles !== undefined && !nextRoles.includes('admin')) ||
        input.is_active === false);

    if (losesAdmin) {
      const otherAdmins = await this.prisma.user_roles.count({
        where: {
          roles: { is: { code: 'admin' } },
          users: { is: { is_active: true, NOT: { id } } },
        },
      });

      if (otherAdmins === 0) {
        throw new BadRequestException('Cannot remove the last active admin');
      }
    }

    let roleRecords: Array<{ id: number }> = [];

    if (nextRoles !== undefined) {
      roleRecords = await this.prisma.roles.findMany({
        where: { code: { in: nextRoles } },
        select: { id: true },
      });

      if (roleRecords.length !== nextRoles.length) {
        throw new BadRequestException('Invalid role');
      }
    }

    const data = {
      ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
      ...(nextRoles !== undefined
        ? {
            user_roles: {
              deleteMany: {},
              create: roleRecords.map((record) => ({ role_id: record.id })),
            },
          }
        : {}),
    };

    const updated = await this.prisma.users.update({
      where: { id },
      data,
      select: this.userSelect,
    });

    return this.withRoles(updated);
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
