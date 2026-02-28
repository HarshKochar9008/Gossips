import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller()
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  // ---- Public Routes ----

  @Get('public/feed')
  @Throttle({ default: { ttl: 60_000, limit: 60 } })
  async getPublicFeed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.blogsService.getPublicFeed(page, Math.min(limit, 50));
  }

  @Get('public/blogs/:slug')
  @UseGuards(OptionalAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 60 } })
  async getPublicBlog(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload | null,
  ) {
    return this.blogsService.getPublicBlogBySlug(slug, user?.sub);
  }

  // ---- Protected Dashboard Routes ----

  @Get('dashboard/blogs')
  @UseGuards(AuthGuard('jwt'))
  async getMyBlogs(@CurrentUser() user: JwtPayload) {
    return this.blogsService.findAllByAuthor(user.sub);
  }

  @Get('dashboard/blogs/:id')
  @UseGuards(AuthGuard('jwt'))
  async getMyBlog(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogsService.findOneByAuthor(id, user.sub);
  }

  @Post('dashboard/blogs')
  @UseGuards(AuthGuard('jwt'))
  async createBlog(
    @Body() dto: CreateBlogDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogsService.create(dto, user.sub);
  }

  @Put('dashboard/blogs/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogsService.update(id, dto, user.sub);
  }

  @Patch('dashboard/blogs/:id/toggle-publish')
  @UseGuards(AuthGuard('jwt'))
  async togglePublish(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogsService.togglePublish(id, user.sub);
  }

  @Delete('dashboard/blogs/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteBlog(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogsService.delete(id, user.sub);
  }
}
