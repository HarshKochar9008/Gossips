import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SummaryJob {
  blogId: string;
  retries: number;
}

@Injectable()
export class BlogSummaryService {
  private readonly logger = new Logger(BlogSummaryService.name);
  private readonly queue: SummaryJob[] = [];
  private processing = false;

  constructor(private readonly prisma: PrismaService) {}

  enqueueGenerateSummary(blogId: string): void {
    this.queue.push({ blogId, retries: 0 });
    this.logger.log(`Enqueued summary generation for blog ${blogId}`);
    setImmediate(() => this.processQueue());
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      try {
        await this.generateSummary(job.blogId);
        this.logger.log(`Summary generated successfully for blog ${job.blogId}`);
      } catch (error) {
        if (job.retries < 3) {
          this.queue.push({ blogId: job.blogId, retries: job.retries + 1 });
          this.logger.warn(
            `Retry ${job.retries + 1}/3 for blog summary ${job.blogId}`,
          );
        } else {
          this.logger.error(
            `Failed to generate summary for blog ${job.blogId} after 3 retries`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    }

    this.processing = false;
  }

  private async generateSummary(blogId: string): Promise<void> {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { content: true },
    });
    if (!blog) return;

    const sentences = blog.content.match(/[^.!?]+[.!?]+/g) || [];
    const summary =
      sentences.slice(0, 3).join(' ').trim().substring(0, 300) ||
      blog.content.substring(0, 300);

    await this.prisma.blog.update({
      where: { id: blogId },
      data: { summary },
    });
  }
}
