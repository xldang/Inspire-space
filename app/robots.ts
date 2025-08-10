import { MetadataRoute } from 'next'
 
// FIXME: 部署后请将此URL替换为您的实际域名
const URL = 'https://www.fallinai.cn';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*', // 对所有爬虫生效
        allow: '/', // 允许访问首页和静态资源
        // 禁止爬虫访问所有用户内容和功能性页面
        disallow: [
          '/idea/', // 禁止访问所有灵感详情页
          '/admin/', 
          '/api/',
        ],
      },
    ],
    // 指向您的站点地图
    sitemap: `${URL}/sitemap.xml`,
  }
}
