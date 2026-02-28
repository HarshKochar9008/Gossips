import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from '../entities';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
  ) {}

  async toggle(blogId: string, userId: string) {
    const existing = await this.likeRepo.findOne({
      where: { blogId, userId },
    });
    if (existing) {
      await this.likeRepo.remove(existing);
      return { liked: false, count: await this.getCount(blogId) };
    }
    const like = this.likeRepo.create({ blogId, userId });
    await this.likeRepo.save(like);
    return { liked: true, count: await this.getCount(blogId) };
  }

  async getStatus(blogId: string, userId?: string) {
    const count = await this.getCount(blogId);
    let liked = false;
    if (userId) {
      const existing = await this.likeRepo.findOne({
        where: { blogId, userId },
      });
      liked = !!existing;
    }
    return { liked, count };
  }

  private async getCount(blogId: string): Promise<number> {
    return this.likeRepo.count({ where: { blogId } });
  }
}
