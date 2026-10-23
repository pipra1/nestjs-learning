import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: 'user',
      },
    });

    return this.toPublicUser(user);
  }

  toPublicUser(user: {
    id: number;
    email: string;
    role: 'user' | 'admin';
  }) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async findByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    return this.prisma.user.findUnique({ where: { email: normalizedEmail } });
  }

  async updateRefreshTokenHash(userId: number, refreshTokenHash: string | null) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }
}
