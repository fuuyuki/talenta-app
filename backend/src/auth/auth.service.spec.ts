import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    users: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      users: {
        findUnique: jest.fn(),
        create: jest.fn(),
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

  describe('register', () => {
    it('creates a user with a hashed password', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      prisma.users.create.mockResolvedValue({ id: 'user-1' });

      const result = await service.register(
        'user@example.com',
        'secret',
        'mentor',
      );

      expect(prisma.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'user@example.com',
          role: 'mentor',
        }),
      });
      const { password_hash } = prisma.users.create.mock.calls[0][0].data;
      expect(password_hash).not.toBe('secret');
      expect(await bcrypt.compare('secret', password_hash)).toBe(true);
      expect(result).toEqual({
        message: 'User registered successfully',
        userId: 'user-1',
      });
    });

    it('defaults the role to mentee', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      prisma.users.create.mockResolvedValue({ id: 'user-1' });

      await service.register('user@example.com', 'secret');

      expect(prisma.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'mentee' }),
      });
    });

    it('rejects an email that is already registered', async () => {
      prisma.users.findUnique.mockResolvedValue({ id: 'user-1' });

      await expect(
        service.register('user@example.com', 'secret'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.users.create).not.toHaveBeenCalled();
    });

    it('rejects an admin role', async () => {
      await expect(
        service.register('user@example.com', 'secret', 'admin'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.users.findUnique).not.toHaveBeenCalled();
      expect(prisma.users.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      const password_hash = await bcrypt.hash('secret', 10);
      prisma.users.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        role: 'mentee',
        password_hash,
        is_active: true,
      });

      const result = await service.login('user@example.com', 'secret');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'user@example.com',
        role: 'mentee',
      });
      expect(result).toEqual({
        access_token: 'signed-token',
        user: { id: 'user-1', email: 'user@example.com', role: 'mentee' },
      });
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
        role: 'mentee',
        password_hash: await bcrypt.hash('secret', 10),
        is_active: true,
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
        role: 'mentee',
        password_hash: await bcrypt.hash('secret', 10),
        is_active: false,
      });

      await expect(
        service.login('user@example.com', 'secret'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
