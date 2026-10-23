import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished() {
    return this.prisma.articles.findMany({
      where: { published: true },
      orderBy: { created_at: 'desc' },
      take: 50,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        published_at: true,
        created_at: true,
      },
    });
  }

  async findPublishedBySlug(slug: string) {
    const article = await this.prisma.articles.findFirst({
      where: { slug, published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        body_md: true,
        published_at: true,
        created_at: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }
}
