import { MetadataRoute } from 'next'
 
// FIXME: 部署后请将此URL替换为您的实际域名
const URL = 'https://www.fallinai.cn';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*', // 对所有爬虫生效
        allow: '/', // 允许爬取所有根路径下的内容
        // 禁止爬虫访问可能包含敏感信息或对SEO无价值的页面
        disallow: [
          '/admin/', 
          '/idea/*/edit', // 所有灵感的编辑页
          '/api/', // 所有API路由
        ],
      },
    ],
    // 指向您的站点地图
    sitemap: `${URL}/sitemap.xml`,
  }
}
