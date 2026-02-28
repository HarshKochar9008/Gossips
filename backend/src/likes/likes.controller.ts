import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LikesService } from './likes.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';

@Controller('blogs/:blogId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle')
  @UseGuards(AuthGuard('jwt'))
  async toggleLike(
    @Param('blogId') blogId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.likesService.toggle(blogId, user.sub);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getLikeStatus(
    @Param('blogId') blogId: string,
    @CurrentUser() user: JwtPayload | null,
  ) {
    return this.likesService.getStatus(blogId, user?.sub);
  }
}
