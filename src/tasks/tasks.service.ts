import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        ownerId: userId,
      },
    });
  }

  async findAll(userId: number, userRole: 'user' | 'admin') {
    return this.prisma.task.findMany({
      where: userRole === 'admin' ? {} : { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(taskId: number, userId: number, userRole: 'user' | 'admin') {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (userRole !== 'admin' && task.ownerId !== userId) {
      throw new ForbiddenException('You cannot access another user’s task');
    }

    return task;
  }

  async update(
    taskId: number,
    dto: UpdateTaskDto,
    userId: number,
    userRole: 'user' | 'admin',
  ) {
    // Check existence and ownership first.
    await this.findOne(taskId, userId, userRole);

    return this.prisma.task.update({
      where: { id: taskId },
      data: dto,
    });
  }

  async remove(taskId: number, userId: number, userRole: 'user' | 'admin') {
    // Check existence and ownership first.
    await this.findOne(taskId, userId, userRole);

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
