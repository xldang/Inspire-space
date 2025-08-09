import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const inspirations = await prisma.inspiration.findMany({
      where: {
        userId
      },
      include: {
        user: {
          select: {
            clerkId: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ inspirations })
  } catch (error) {
    console.error('获取灵感列表失败:', error)
    return NextResponse.json(
      { error: '获取数据失败' }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const { content, suggestion } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: '灵感内容不能为空' }, 
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: '灵感内容不能超过1000字符' }, 
        { status: 400 }
      )
    }

    // 获取用户信息以确保邮箱正确
    const user = await clerkClient.users.getUser(userId);
    const userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || 'no-email@example.com';

    // 创建或更新用户，确保邮箱信息正确
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: { email: userEmail },
      create: {
        clerkId: userId,
        email: userEmail,
      }
    })

    const inspiration = await prisma.inspiration.create({
      data: {
        content: content.trim(),
        suggestion: suggestion?.trim() || null,
        userId,
      },
      include: {
        user: {
          select: {
            clerkId: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ inspiration }, { status: 201 })
  } catch (error) {
    console.error('创建灵感失败:', error)
    return NextResponse.json(
      { error: '创建灵感失败' }, 
      { status: 500 }
    )
  }
}
