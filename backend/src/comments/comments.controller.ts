import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('blogs/:blogId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getComments(@Param('blogId') blogId: string) {
    return this.commentsService.findByBlog(blogId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createComment(
    @Param('blogId') blogId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.create(blogId, dto, user.sub);
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.delete(commentId, user.sub);
  }
}
