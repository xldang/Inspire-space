import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import IdeaDetailClient from './IdeaDetailClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

type Props = {
  params: { id: string }
}

async function getUserSession() {
  const session = await getServerSession(authOptions);
  return session;
}

// 1. 生成动态元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getUserSession();
  if (!session?.user?.id) {
    return {
      title: '灵感详情',
    }
  }

  const inspiration = await prisma.inspiration.findUnique({
    where: { id: params.id, userId: session.user.id },
  });

  if (!inspiration) {
    return {
      title: '未找到灵感',
      description: '该灵感不存在或已被删除。',
    }
  }

  const description = `关于“${inspiration.content.substring(0, 100)}...”的灵感详情、AI建议和实施方案。`;

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
  const session = await getUserSession();
  if (!session?.user?.id) {
    notFound();
  }

  const inspiration = await prisma.inspiration.findUnique({
    where: { 
      id: params.id,
      userId: session.user.id, // 安全性：确保用户只能访问自己的灵感
    },
    include: {
        user: {
            select: {
                id: true,
                email: true,
                name: true,
            }
        }
    }
  });

  if (!inspiration) {
    notFound();
  }

  // 3. 将数据传递给客户端组件进行渲染
  // The type of `inspiration` from prisma now matches what IdeaDetailClient expects
  return <IdeaDetailClient inspiration={inspiration as any} />;
}
