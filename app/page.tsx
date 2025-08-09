import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import HomePageClient from '../components/HomePageClient'
import { Inspiration } from '@prisma/client'

interface ExtendedInspiration extends Inspiration {
  user: {
    clerkId: string
    email: string
  }
}

export default async function HomePage() {
  const { userId } = auth()
  const isSignedIn = !!userId

  let inspirations: ExtendedInspiration[] = []

  if (isSignedIn) {
    try {
      inspirations = await prisma.inspiration.findMany({
        where: {
          userId,
        },
        include: {
          user: {
            select: {
              clerkId: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }) as ExtendedInspiration[];
    } catch (error) {
      console.error('服务器端获取灵感列表失败:', error)
      // 生产环境中，这里可能需要更优雅的错误处理，例如返回空数组或错误页面
    }
  }

  return (
    <HomePageClient
      initialInspirations={inspirations}
      initialIsSignedIn={isSignedIn}
    />
  )
}
