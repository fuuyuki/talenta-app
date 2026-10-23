import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !pass) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.users.findUnique({
      where: { email: normalizedEmail },
      include: {
        user_roles: {
          select: { roles: { select: { code: true } } },
        },
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.is_active) throw new UnauthorizedException('Account is inactive');

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const roles = user.user_roles.map((item) => item.roles.code);
    if (roles.length === 0) {
      throw new UnauthorizedException('Account has no role assigned');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, roles },
    };
  }
}
