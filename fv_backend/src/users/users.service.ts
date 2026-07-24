import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toUserResponse } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getProfile(id: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Kullanici bulunamadi');
    }

    return toUserResponse(user);
  }
}
