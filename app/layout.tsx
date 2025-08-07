import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: '灵感空间 - Inspire Space',
  description: '记录并实现你的灵感想法，让AI帮你制定可执行的方案',
  keywords: '灵感记录,目标实现,AI助手,创意管理',
  authors: [{ name: '灵感空间团队' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: '灵感空间 - Inspire Space',
    description: '记录并实现你的灵感想法，让AI帮你制定可执行的方案',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="zh-CN" className={`${inter.variable} ${inter.className}`}>
        <body className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}