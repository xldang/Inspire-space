import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// 获取设置
export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const setting = await prisma.setting.findUnique({
      where: { key: 'OPENROUTER_API_KEY' },
    })

    return NextResponse.json({ value: setting?.value || '' })
  } catch (error) {
    console.error('获取设置失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 创建或更新设置
export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { key, value } = await req.json()

    if (key !== 'OPENROUTER_API_KEY') {
      return NextResponse.json({ error: '无效的 Key' }, { status: 400 })
    }

    if (typeof value !== 'string') {
      return NextResponse.json({ error: '无效的 Value' }, { status: 400 })
    }

    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('保存设置失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
