import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

async function getUserIdFromSession() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return session.user.id;
  }
  return null;
}

export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const inspirations = await prisma.inspiration.findMany({
      where: {
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ inspirations });
  } catch (error) {
    console.error('获取灵感列表失败:', error);
    return NextResponse.json(
      { error: '获取数据失败' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json();
    const { content, suggestion } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: '灵感内容不能为空' }, 
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: '灵感内容不能超过1000字符' }, 
        { status: 400 }
      );
    }

    const inspiration = await prisma.inspiration.create({
      data: {
        content: content.trim(),
        suggestion: suggestion?.trim() || null,
        userId,
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

    return NextResponse.json({ inspiration }, { status: 201 });
  } catch (error) {
    console.error('创建灵感失败:', error);
    return NextResponse.json(
      { error: '创建灵感失败' }, 
      { status: 500 }
    );
  }
}
