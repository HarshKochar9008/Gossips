import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(blogId: string, dto: CreateCommentDto, userId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });
    if (!blog) throw new NotFoundException('Blog not found');

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        blogId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      id: comment.id,
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt,
    };
  }

  async findByBlog(blogId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      author: c.author,
      createdAt: c.createdAt,
    }));
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, authorId: userId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.prisma.comment.delete({ where: { id: commentId } });
  }
}
