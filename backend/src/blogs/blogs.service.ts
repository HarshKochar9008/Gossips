import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogSummaryService } from '../blog-jobs/blog-summary.service';
import { Blog } from '../entities';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
    private readonly blogSummaryService: BlogSummaryService,
  ) {}

  private generateSlug(title: string, existingId?: string): string {
    const base = slugify(title, { lower: true, strict: true }) || 'blog';
    const suffix = existingId
      ? existingId.slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
    return `${base}-${suffix}`;
  }

  async create(dto: CreateBlogDto, userId: string) {
    const blog = this.blogRepo.create({
      title: dto.title,
      content: dto.content,
      summary: dto.summary ?? null,
      excerpt: dto.excerpt ?? null,
      isPublished: dto.isPublished ?? false,
      authorId: userId,
    });
    blog.slug = this.generateSlug(dto.title);
    await this.blogRepo.save(blog);
    this.blogSummaryService.enqueueGenerateSummary(blog.id);
    return this.toResponse(blog);
  }

  async findAllByAuthor(userId: string) {
    const blogs = await this.blogRepo.find({
      where: { authorId: userId },
      order: { updatedAt: 'DESC' },
      relations: ['comments', 'likes', 'author'],
    });
    return blogs.map((b) => this.toResponse(b));
  }

  async findOneByAuthor(id: string, userId: string) {
    const blog = await this.blogRepo.findOne({
      where: { id, authorId: userId },
      relations: ['comments', 'likes', 'author'],
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return this.toResponse(blog);
  }

  async update(id: string, dto: UpdateBlogDto, userId: string) {
    const blog = await this.blogRepo.findOne({
      where: { id, authorId: userId },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    if (dto.title !== undefined) {
      blog.title = dto.title;
      blog.slug = this.generateSlug(dto.title, blog.id);
    }
    if (dto.content !== undefined) blog.content = dto.content;
    if (dto.summary !== undefined) blog.summary = dto.summary;
    if (dto.excerpt !== undefined) blog.excerpt = dto.excerpt;
    if (dto.isPublished !== undefined) blog.isPublished = dto.isPublished;
    await this.blogRepo.save(blog);
    this.blogSummaryService.enqueueGenerateSummary(blog.id);
    return this.toResponse(blog);
  }

  async delete(id: string, userId: string) {
    const result = await this.blogRepo.delete({ id, authorId: userId });
    if (result.affected === 0) throw new NotFoundException('Blog not found');
  }

  async togglePublish(id: string, userId: string) {
    const blog = await this.blogRepo.findOne({
      where: { id, authorId: userId },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    blog.isPublished = !blog.isPublished;
    await this.blogRepo.save(blog);
    return this.toResponse(blog);
  }

  async getPublicFeed(page: number = 1, limit: number = 10) {
    const [blogs, total] = await this.blogRepo.findAndCount({
      where: { isPublished: true },
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'title', 'summary', 'excerpt', 'slug', 'updatedAt'],
    });
    const totalPages = Math.ceil(total / limit);
    return {
      blogs: blogs.map((b) => this.toResponse(b)),
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
    const blog = await this.blogRepo.findOne({
      where: { slug, isPublished: true },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return this.toResponse(blog);
  }

  private toResponse(blog: Blog) {
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
      author: blog.author
        ? { id: blog.author.id, name: blog.author.name, email: blog.author.email }
        : undefined,
      _count: {
        comments: blog.comments?.length ?? 0,
        likes: blog.likes?.length ?? 0,
      },
    };
  }
}
