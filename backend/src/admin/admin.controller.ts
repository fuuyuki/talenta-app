import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  AdminService,
  type CreateUserInput,
  type UpdateUserInput,
} from './admin.service';

@Controller('api/admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('role') role?: string) {
    return this.adminService.listUsers({ search, role });
  }

  @Post()
  create(@Body() body: CreateUserInput) {
    return this.adminService.createUser(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserInput) {
    return this.adminService.updateUser(id, body);
  }

  @Post(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() body: { password?: string },
  ) {
    return this.adminService.resetPassword(id, body.password);
  }
}
