import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

// Lazy initialization of Prisma client for build environments
let prisma: PrismaClient | null = null

function getPrisma() {
  if (!prisma) {
    try {
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL || 'file:./dev.db'
          }
        }
      })
    } catch (error) {
      console.warn('Prisma initialization failed:', error)
      return null
    }
  }
  return prisma
}

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const db = getPrisma()
    if (!db) {
      return NextResponse.json({ inspirations: [] })
    }

    const inspirations = await db.inspiration.findMany({
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

    // 创建或更新用户
    const db = getPrisma()
    if (!db) {
      return NextResponse.json({ error: '数据库初始化失败' }, { status: 500 })
    }

    await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: 'temp@example.com', // Clerk会自动更新这个
      }
    })

    const inspiration = await db.inspiration.create({
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