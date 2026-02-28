import { Module } from '@nestjs/common';
import { BlogSummaryService } from './blog-summary.service';

@Module({
  providers: [BlogSummaryService],
  exports: [BlogSummaryService],
})
export class BlogJobsModule {}
