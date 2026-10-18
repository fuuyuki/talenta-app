import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, pass: string, role: string = 'mentee') {
    // 1. Only mentees and mentors can self-register; admins are provisioned separately
    if (!['mentee', 'mentor'].includes(role))
      throw new BadRequestException('Invalid role');

    // 2. Check if user exists
    const existing = await this.prisma.users.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);

    // 4. Create user
    const user = await this.prisma.users.create({
      data: { email, password_hash: hash, role },
    });

    return { message: 'User registered successfully', userId: user.id };
  }

  async login(email: string, pass: string) {
    // 1. Find user
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.is_active) throw new UnauthorizedException('Account is inactive');

    // 2. Compare password
    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // 3. Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
