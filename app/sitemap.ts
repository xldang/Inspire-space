import { MetadataRoute } from 'next'

// FIXME: 部署后请将此URL替换为您的实际域名
const URL = 'https://www.fallinai.cn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // 2. 只包含核心静态页面
  const staticUrls = [
    {
      url: URL,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    // 如果您有 "关于"、"价格"、"联系我们" 等公开页面，也应在此处添加
    // {
    //   url: `${URL}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: 'yearly' as const,
    //   priority: 0.8,
    // }
  ];

  return staticUrls;
}
