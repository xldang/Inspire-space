'use client'

import { useState, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Inspiration } from '@prisma/client'
import {
  ArrowLeft,
  Lightbulb,
  Calendar,
  Loader2,
  Trash2,
  Edit,
  FileText,
  Sparkles,
  Rocket,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'

// 定义扩展后的灵感类型
interface ExtendedInspiration extends Inspiration {
  user: {
    clerkId: string
    email: string
  }
}

interface IdeaDetailClientProps {
  inspiration: ExtendedInspiration;
}

export default function IdeaDetailClient({ inspiration }: IdeaDetailClientProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const id = inspiration.id;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      '你确定要永久删除这个灵感吗？此操作无法撤销。'
    )
    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/inspirations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('删除失败，请稍后重试')
      }

      // 删除成功后，跳转到首页
      router.push('/')
      router.refresh() // 确保服务器数据刷新
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除过程中发生未知错误')
      setIsDeleting(false)
    }
  }


  const getStatusChip = (status: string) => {
    switch (status) {
      case 'ORIGINAL':
        return <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">原始构想</span>
      case 'BUILDING':
        return <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm">筑梦中</span>
      case 'ACHIEVED':
        return <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm">已达成</span>
      default:
        return null
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://www.fallinai.cn/idea/${inspiration.id}`,
    },
    'headline': inspiration.content.substring(0, 50),
    'description': (inspiration.suggestion || inspiration.content).substring(0, 150),
    'author': {
      '@type': 'Person',
      'name': inspiration.user.email, // 使用用户邮箱作为作者名
    },
    'publisher': {
      '@type': 'Organization',
      'name': '灵感空间',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.fallinai.cn/logo.png', // FIXME: 替换为您的logo地址
      },
    },
    'datePublished': inspiration.createdAt,
    'dateModified': inspiration.updatedAt,
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">灵感详情</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4" />
                <span>创建于 {format(new Date(inspiration.createdAt), 'yyyy年MM月dd日')}</span>
              </div>
            </div>
          </div>
          {getStatusChip(inspiration.status)}
        </div>

        <div className="space-y-8 prose prose-lg max-w-none">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-gray-800 m-0">原始想法</h2>
            </div>
            <p className="mt-2 text-gray-700">{inspiration.content}</p>
          </section>

          {inspiration.suggestion && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-800 m-0">AI 初步建议</h2>
              </div>
              <div className="mt-2 text-gray-700">
                <ReactMarkdown>{inspiration.suggestion}</ReactMarkdown>
              </div>
            </section>
          )}

          {inspiration.implementationPlan && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-800 m-0">灵感落地方案</h2>
              </div>
              <div className="mt-2 text-gray-700">
                <ReactMarkdown>{inspiration.implementationPlan}</ReactMarkdown>
              </div>
            </section>
          )}
        </div>

        <div className="mt-10 border-t pt-6 flex justify-end gap-4">
          <Link href={`/idea/${id}/edit`} passHref>
            <button
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-5 h-5 mr-2" />
              编辑
            </button>
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors"
          >
            {isDeleting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5 mr-2" />
            )}
            {isDeleting ? '删除中...' : '删除灵感'}
          </button>
        </div>
      </div>
    </div>
  )
}
