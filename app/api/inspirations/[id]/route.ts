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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = auth()
    const { id } = await params
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const db = getPrisma()
    if (!db) {
      return NextResponse.json({ error: '数据库初始化失败' }, { status: 500 })
    }

    const inspiration = await db.inspiration.findUnique({
      where: {
        id: id,
        userId // 确保只能访问自己的灵感
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (!inspiration) {
      return NextResponse.json(
        { error: '灵感不存在' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({ inspiration })
  } catch (error) {
    console.error('获取灵感详情失败:', error)
    return NextResponse.json(
      { error: '获取数据失败' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = auth()
    const { id } = await params
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const { content, suggestion, status } = body

    const db = getPrisma()
    if (!db) {
      return NextResponse.json({ error: '数据库初始化失败' }, { status: 500 })
    }

    // 验证灵感是否存在且属于当前用户
    const existingInspiration = await db.inspiration.findUnique({
      where: {
        id: id,
        userId
      }
    })

    if (!existingInspiration) {
      return NextResponse.json(
        { error: '灵感不存在' }, 
        { status: 404 }
      )
    }

    // 构建更新数据
    const updateData: any = {}
    
    if (content !== undefined) {
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
      updateData.content = content.trim()
    }

    if (suggestion !== undefined) {
      updateData.suggestion = suggestion.trim() || null
    }

    if (status !== undefined) {
      if (!['ORIGINAL', 'BUILDING', 'ACHIEVED'].includes(status)) {
        return NextResponse.json(
          { error: '无效的状态值' }, 
          { status: 400 }
        )
      }
      updateData.status = status
    }

    const inspiration = await db.inspiration.update({
      where: {
        id: id
      },
      data: updateData,
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    return NextResponse.json({ inspiration })
  } catch (error) {
    console.error('更新灵感失败:', error)
    return NextResponse.json(
      { error: '更新数据失败' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = auth()
    const { id } = await params
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const db = getPrisma()
    if (!db) {
      return NextResponse.json({ error: '数据库初始化失败' }, { status: 500 })
    }

    const inspiration = await db.inspiration.findUnique({
      where: {
        id: id,
        userId
      }
    })

    if (!inspiration) {
      return NextResponse.json(
        { error: '灵感不存在' }, 
        { status: 404 }
      )
    }

    await db.inspiration.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除灵感失败:', error)
    return NextResponse.json(
      { error: '删除失败' }, 
      { status: 500 }
    )
  }
}