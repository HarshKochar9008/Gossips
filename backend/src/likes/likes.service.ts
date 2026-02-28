import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(blogId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { blogId_userId: { blogId, userId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      const count = await this.prisma.like.count({ where: { blogId } });
      return { liked: false, count };
    }

    await this.prisma.like.create({ data: { blogId, userId } });
    const count = await this.prisma.like.count({ where: { blogId } });
    return { liked: true, count };
  }

  async getStatus(blogId: string, userId?: string) {
    const count = await this.prisma.like.count({ where: { blogId } });
    let liked = false;

    if (userId) {
      const existing = await this.prisma.like.findUnique({
        where: { blogId_userId: { blogId, userId } },
      });
      liked = !!existing;
    }

    return { liked, count };
  }
}
