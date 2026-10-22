import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    return this.usersService.create(dto.email, dto.password);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    
    if(!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.generateTokens(user.id, user.email, user.role);
  }

  private async generateTokens(userId: number, email: string, role: 'user' | 'admin') {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  async refreshTokens(refreshToken: string) {
    let payload: {
      sub: number;
      email: string;
      role: 'user' | 'admin';
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string> ('JWT_REFRESH_SECRET', ), 
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = this.usersService.findById(payload.sub);

    if(!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token has been revoked')
    }

    // Snapshot the hash synchronously before any async gaps, then immediately
    // nullify it so concurrent / replayed requests see no hash and are rejected.
    const storedHash = user.refreshTokenHash;
    await this.usersService.updateRefreshTokenHash(user.id, null);

    const isTokenValid = await bcrypt.compare(refreshToken, storedHash);

    if(!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(refreshToken: string): Promise<void> {
    let payload: {
      sub: number;
    }

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string> ('JWT_REFRESH_SECRET'),
      });
    } catch {
      return;
    }

    const user = this.usersService.findById(payload.sub);

    if(!user?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if(isTokenValid) {
      await this.usersService.updateRefreshTokenHash(user.id, null);
    }
  }
}
