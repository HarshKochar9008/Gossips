import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { BlogJobsModule } from '../blog-jobs/blog-jobs.module';
import { Blog } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), BlogJobsModule],
  controllers: [BlogsController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}
