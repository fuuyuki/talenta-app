import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    login: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
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
