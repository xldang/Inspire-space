import { NextResponse } from 'next/server';
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

// 获取设置
export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const settings = await prisma.setting.findMany();

    return NextResponse.json(settings);
  } catch (error) {
    console.error('获取设置失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建或更新设置
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const settings: { key: string; value: string }[] = await req.json();

    for (const setting of settings) {
      if (typeof setting.key !== 'string' || typeof setting.value !== 'string') {
        return NextResponse.json({ error: '无效的设置格式' }, { status: 400 });
      }

      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存设置失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
