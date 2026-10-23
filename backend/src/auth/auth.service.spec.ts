import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    users: {
      findUnique: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      users: {
        findUnique: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it('returns a token and all roles for valid credentials', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password_hash: await bcrypt.hash('secret', 10),
        is_active: true,
        user_roles: [
          { roles: { code: 'mentor' } },
          { roles: { code: 'mentee' } },
        ],
      });

      const result = await service.login('user@example.com', 'secret');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'user@example.com',
      });
      expect(result).toEqual({
        access_token: 'signed-token',
        user: {
          id: 'user-1',
          email: 'user@example.com',
          roles: ['mentor', 'mentee'],
        },
      });
    });

    it('normalizes the email before lookup', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(
        service.login(' User@Example.com ', 'secret'),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(prisma.users.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'user@example.com' } }),
      );
    });

    it('rejects an unknown email', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(
        service.login('missing@example.com', 'secret'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password_hash: await bcrypt.hash('secret', 10),
        is_active: true,
        user_roles: [{ roles: { code: 'mentee' } }],
      });

      await expect(
        service.login('user@example.com', 'wrong'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('rejects an inactive account', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password_hash: await bcrypt.hash('secret', 10),
        is_active: false,
        user_roles: [{ roles: { code: 'mentee' } }],
      });

      await expect(
        service.login('user@example.com', 'secret'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('rejects an account without any role', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password_hash: await bcrypt.hash('secret', 10),
        is_active: true,
        user_roles: [],
      });

      await expect(
        service.login('user@example.com', 'secret'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('rejects missing credentials', async () => {
      await expect(service.login('', '')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.users.findUnique).not.toHaveBeenCalled();
    });
  });
});
