import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogSummaryService {
  enqueueGenerateSummary(_blogId: string) {
    // No-op: database not configured
  }
}
