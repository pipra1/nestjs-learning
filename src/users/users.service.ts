import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.interface.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  findById(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  async create(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = this.users.find(user => user.email == normalizedEmail);

    if(existingUser) {
      throw new ConflictException('Email is already registered')
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user: User = {
      id: this.nextId++,
      email: normalizedEmail,
      passwordHash,
      role: 'user',
    }

    this.users.push(user);

    return this.toPublicUser(user);
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    }
  }

  async findByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    return this.users.find(user => user.email === normalizedEmail)
  }

  async updateRefreshTokenHash(userId: number, refreshTokenHash: string | null) {
    const user = this.findById(userId);

    if(!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshTokenHash = refreshTokenHash;
  }
}
