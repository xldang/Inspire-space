import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: '灵感空间 - 您的私人AI创意与项目管理助手',
  description: '使用灵感空间（Inspire Space）捕捉、孵化和实现您的每一个想法。我们提供智能AI分析，将您的抽象概念转化为具体的行动方案，是您理想的创意管理与项目实践工具。',
  keywords: '灵感管理, AI助手, 创意孵化, 项目管理, 想法实现, 个人工具, 生产力',
  authors: [{ name: '灵感空间团队', url: 'https://www.fallinai.cn' }],
  openGraph: {
    title: '灵感空间 - 您的私人AI创意与项目管理助手',
    description: '使用灵感空间（Inspire Space）捕捉、孵化和实现您的每一个想法。我们提供智能AI分析，将您的抽象概念转化为具体的行动方案。',
    url: 'https://www.fallinai.cn',
    type: 'website',
    siteName: '灵感空间',
  },
  twitter: {
    card: 'summary_large_image',
    title: '灵感空间 - 您的私人AI创意与项目管理助手',
    description: '从一个想法到具体行动方案，灵感空间是您首选的AI创意管理工具。',
    // creator: '@YourTwitterHandle', // 如果您有Twitter账号
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${inter.className}`}>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <AuthProvider>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
