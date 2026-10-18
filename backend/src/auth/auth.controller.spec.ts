import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates register to AuthService', async () => {
    authService.register.mockResolvedValue({ userId: 'user-1' });

    const result = await controller.register({
      email: 'user@example.com',
      password: 'secret',
      role: 'mentee',
    });

    expect(authService.register).toHaveBeenCalledWith(
      'user@example.com',
      'secret',
      'mentee',
    );
    expect(result).toEqual({ userId: 'user-1' });
  });

  it('delegates login to AuthService', async () => {
    authService.login.mockResolvedValue({ access_token: 'token' });

    const result = await controller.login({
      email: 'user@example.com',
      password: 'secret',
    });

    expect(authService.login).toHaveBeenCalledWith(
      'user@example.com',
      'secret',
    );
    expect(result).toEqual({ access_token: 'token' });
  });
});
