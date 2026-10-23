import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { RolesGuard } from '../auth/roles.guard';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [AdminModule],
  controllers: [MembersController],
  providers: [MembersService, RolesGuard],
})
export class MembersModule {}
