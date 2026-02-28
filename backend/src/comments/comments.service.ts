import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from '../entities';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async create(blogId: string, dto: CreateCommentDto, userId: string) {
    const comment = this.commentRepo.create({
      content: dto.content,
      blogId,
      authorId: userId,
    });
    await this.commentRepo.save(comment);
    return this.toResponse(comment);
  }

  async findByBlog(blogId: string) {
    const comments = await this.commentRepo.find({
      where: { blogId },
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });
    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorId: c.authorId,
      authorName: (c.author as { name?: string })?.name ?? 'Anonymous',
      createdAt: c.createdAt,
    }));
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId, authorId: userId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentRepo.remove(comment);
  }

  private toResponse(comment: Comment) {
    return {
      id: comment.id,
      content: comment.content,
      blogId: comment.blogId,
      authorId: comment.authorId,
      createdAt: comment.createdAt,
    };
  }
}
