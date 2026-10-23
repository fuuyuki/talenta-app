import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { AdminModule } from './admin/admin.module';
import { MembersModule } from './members/members.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { SuperadminBootstrapService } from './bootstrap/superadmin-bootstrap.service';

@Module({
  imports: [PrismaModule, AuthModule, ArticlesModule, AdminModule, MembersModule],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService, SuperadminBootstrapService],
})
export class AppModule {}
