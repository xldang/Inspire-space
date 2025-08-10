import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import IdeaDetailClient from './IdeaDetailClient'
import { auth } from '@clerk/nextjs/server'

type Props = {
  params: { id: string }
}

// 1. 生成动态元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = auth()
  if (!userId) {
    return {
      title: '灵感详情',
    }
  }

  const inspiration = await prisma.inspiration.findUnique({
    where: { id: params.id, userId },
  })

  if (!inspiration) {
    return {
      title: '未找到灵感',
      description: '该灵感不存在或已被删除。',
    }
  }

  const description = `关于“${inspiration.content.substring(0, 100)}...”的灵感详情、AI建议和实施方案。`

  return {
    title: `灵感详情: ${inspiration.content.substring(0, 30)}...`,
    description: description,
    openGraph: {
        title: `灵感详情: ${inspiration.content.substring(0, 30)}...`,
        description: description,
        type: 'article',
        publishedTime: inspiration.createdAt.toISOString(),
        modifiedTime: inspiration.updatedAt.toISOString(),
        authors: ['灵感空间用户'],
    }
  }
}

// 2. 页面本身作为服务器组件
export default async function IdeaPage({ params }: Props) {
  const { userId } = auth()
  if (!userId) {
    // 可以重定向到登录页或显示未授权信息
    // 为了简单起见，我们依赖Clerk中间件的处理
    // 但在服务器组件中直接获取可以防止未授权用户看到任何内容
    notFound();
  }

  const inspiration = await prisma.inspiration.findUnique({
    where: { 
      id: params.id,
      userId: userId, // 安全性：确保用户只能访问自己的灵感
    },
    include: {
        user: {
            select: {
                clerkId: true,
                email: true,
            }
        }
    }
  })

  if (!inspiration) {
    notFound()
  }

  // 3. 将数据传递给客户端组件进行渲染
  return <IdeaDetailClient inspiration={inspiration} />
}