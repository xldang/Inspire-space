import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

// FIXME: 部署后请将此URL替换为您的实际域名
const URL = 'https://www.fallinai.cn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. 获取所有公开的灵感页面
  // 注意：这里假设所有灵感都是公开的。如果您的应用有隐私设置，
  // 您需要在这里只查询公开的灵感。
  const inspirations = await prisma.inspiration.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    }
  });

  const inspirationUrls = inspirations.map((inspiration) => ({
    url: `${URL}/idea/${inspiration.id}`,
    lastModified: inspiration.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 2. 添加核心静态页面
  const staticUrls = [
    {
      url: URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    // 如果您有 "关于"、"联系我们" 等页面，也应在此处添加
    // {
    //   url: `${URL}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly' as const,
    //   priority: 0.5,
    // }
  ];

  return [...staticUrls, ...inspirationUrls];
}
