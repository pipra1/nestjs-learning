import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { RolesModule } from '../roles/roles.module.js';

@Module({
  imports: [AuthModule, RolesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
