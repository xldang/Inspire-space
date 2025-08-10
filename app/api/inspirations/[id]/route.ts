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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromSession();
    const { id } = params;
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const inspiration = await prisma.inspiration.findUnique({
      where: {
        id: id,
        userId // 确保只能访问自己的灵感
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    });

    if (!inspiration) {
      return NextResponse.json(
        { error: '灵感不存在' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ inspiration });
  } catch (error) {
    console.error('获取灵感详情失败:', error);
    return NextResponse.json(
      { error: '获取数据失败' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromSession();
    const { id } = params;
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json();
    const { content, suggestion, status, implementationPlan } = body;

    const existingInspiration = await prisma.inspiration.findUnique({
      where: {
        id: id,
        userId
      }
    });

    if (!existingInspiration) {
      return NextResponse.json(
        { error: '灵感不存在' }, 
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (content !== undefined) {
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
      updateData.content = content.trim();
    }

    if (suggestion !== undefined) {
      updateData.suggestion = suggestion.trim() || null;
    }

    if (status !== undefined) {
      if (!['ORIGINAL', 'BUILDING', 'ACHIEVED'].includes(status)) {
        return NextResponse.json(
          { error: '无效的状态值' }, 
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (implementationPlan !== undefined) {
      updateData.implementationPlan = implementationPlan.trim() || null;
    }

    const inspiration = await prisma.inspiration.update({
      where: {
        id: id
      },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({ inspiration });
  } catch (error) {
    console.error('更新灵感失败:', error);
    return NextResponse.json(
      { error: '更新数据失败' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromSession();
    const { id } = params;
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const inspiration = await prisma.inspiration.findUnique({
      where: {
        id: id,
        userId
      }
    });

    if (!inspiration) {
      return NextResponse.json(
        { error: '灵感不存在' }, 
        { status: 404 }
      );
    }

    await prisma.inspiration.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除灵感失败:', error);
    return NextResponse.json(
      { error: '删除失败' }, 
      { status: 500 }
    );
  }
}
