import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {

  @UseGuards(JwtAuthGuard) // <--- This protects the route!
  @Get('me')
  getMe(@Req() req: any) {
    // req.user is populated by the JwtStrategy we wrote earlier
    return {
      message: 'This is a protected route',
      user: req.user
    };
  }
}
