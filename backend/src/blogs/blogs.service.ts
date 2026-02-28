import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { BlogSummaryService } from '../blog-jobs/blog-summary.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

const AUTHOR_SELECT = { id: true, name: true, email: true } as const;
const BLOG_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  _count: { select: { comments: true, likes: true } },
} as const;

@Injectable()
export class BlogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blogSummaryService: BlogSummaryService,
  ) {}

  private generateSlug(title: string, suffix?: string): string {
    const base = slugify(title, { lower: true, strict: true }) || 'blog';
    const id = suffix || Math.random().toString(36).slice(2, 10);
    return `${base}-${id}`;
  }

  async create(dto: CreateBlogDto, userId: string) {
    const slug = this.generateSlug(dto.title);
    const blog = await this.prisma.blog.create({
      data: {
        title: dto.title,
        content: dto.content,
        summary: dto.summary ?? null,
        excerpt: dto.excerpt ?? null,
        isPublished: dto.isPublished ?? false,
        slug,
        authorId: userId,
      },
      include: BLOG_INCLUDE,
    });

    this.blogSummaryService.enqueueGenerateSummary(blog.id);
    return this.toResponse(blog);
  }

  async findAllByAuthor(userId: string) {
    const blogs = await this.prisma.blog.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: 'desc' },
      include: BLOG_INCLUDE,
    });
    return blogs.map((b) => this.toResponse(b));
  }

  async findOneByAuthor(id: string, userId: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, authorId: userId },
      include: BLOG_INCLUDE,
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return this.toResponse(blog);
  }

  async update(id: string, dto: UpdateBlogDto, userId: string) {
    const existing = await this.prisma.blog.findFirst({
      where: { id, authorId: userId },
    });
    if (!existing) throw new NotFoundException('Blog not found');

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) {
      data.title = dto.title;
      data.slug = this.generateSlug(dto.title, existing.id.slice(0, 8));
    }
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.summary !== undefined) data.summary = dto.summary;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.isPublished !== undefined) data.isPublished = dto.isPublished;

    const blog = await this.prisma.blog.update({
      where: { id },
      data,
      include: BLOG_INCLUDE,
    });

    if (dto.content !== undefined) {
      this.blogSummaryService.enqueueGenerateSummary(blog.id);
    }

    return this.toResponse(blog);
  }

  async delete(id: string, userId: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, authorId: userId },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    await this.prisma.blog.delete({ where: { id } });
  }

  async togglePublish(id: string, userId: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, authorId: userId },
    });
    if (!blog) throw new NotFoundException('Blog not found');

    const updated = await this.prisma.blog.update({
      where: { id },
      data: { isPublished: !blog.isPublished },
      include: BLOG_INCLUDE,
    });
    return this.toResponse(updated);
  }

  async getPublicFeed(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          summary: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          author: { select: AUTHOR_SELECT },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.blog.count({ where: { isPublished: true } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      blogs: blogs.map((b) => ({
        ...b,
        content: undefined,
        publishedAt: b.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getPublicBlogBySlug(slug: string, userId?: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { slug, isPublished: true },
      include: {
        ...BLOG_INCLUDE,
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: AUTHOR_SELECT } },
        },
      },
    });
    if (!blog) throw new NotFoundException('Blog not found');

    let hasLiked = false;
    if (userId) {
      const like = await this.prisma.like.findUnique({
        where: { blogId_userId: { blogId: blog.id, userId } },
      });
      hasLiked = !!like;
    }

    return {
      ...this.toResponse(blog),
      comments: blog.comments.map((c) => ({
        id: c.id,
        content: c.content,
        author: c.author,
        createdAt: c.createdAt,
      })),
      hasLiked,
    };
  }

  private toResponse(blog: any) {
    return {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      summary: blog.summary,
      excerpt: blog.excerpt,
      isPublished: blog.isPublished,
      slug: blog.slug,
      authorId: blog.authorId,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      publishedAt: blog.isPublished ? blog.createdAt : null,
      author: blog.author,
      _count: blog._count ?? { comments: 0, likes: 0 },
    };
  }
}
