import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  MembersService,
  type CreateMemberAccountInput,
  type CreateMemberInput,
} from './members.service';

@Controller('api/admin/members')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('has_account') hasAccount?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.membersService.list({ search, status, hasAccount, take, skip });
  }

  // Declared before `:id` so these paths are not captured by the id route.
  @Get('export')
  async export(@Res() res: Response) {
    const csv = await this.membersService.exportCsv();
    const filename = `anggota-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('template')
  template(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="template-anggota.csv"',
    );
    res.send(this.membersService.templateCsv());
  }

  @Post('import')
  importCsv(@Body() body: unknown) {
    return this.membersService.importCsv(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateMemberInput) {
    return this.membersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: CreateMemberInput) {
    return this.membersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }

  @Post(':id/account')
  createAccount(
    @Param('id') id: string,
    @Body() body: CreateMemberAccountInput,
  ) {
    return this.membersService.createAccount(id, body);
  }
}
