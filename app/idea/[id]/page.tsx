'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit3, Save, X } from 'lucide-react'
import { Inspiration } from '@prisma/client'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'

interface ExtendedInspiration extends Inspiration {
  user: {
    email: string
  }
}

export default function IdeaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [inspiration, setInspiration] = useState<ExtendedInspiration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingContent, setEditingContent] = useState('')
  const [editingSuggestion, setEditingSuggestion] = useState('')
  const [editingImplementationPlan, setEditingImplementationPlan] = useState('')

  useEffect(() => {
    if (id) {
      fetchInspiration()
    }
  }, [id])

  const fetchInspiration = async () => {
    try {
      const response = await fetch(`/api/inspirations/${id}`)
      if (response.ok) {
        const data = await response.json()
        setInspiration(data.inspiration)
        setEditingContent(data.inspiration.content)
        setEditingSuggestion(data.inspiration.suggestion || '')
        setEditingImplementationPlan(data.inspiration.implementationPlan || '')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('获取灵感详情失败:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    try {
      const response = await fetch(`/api/inspirations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const updated = await response.json()
        setInspiration(updated.inspiration)
      }
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/inspirations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editingContent,
          suggestion: editingSuggestion,
          implementationPlan: editingImplementationPlan,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setInspiration(updated.inspiration)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('保存编辑失败:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingContent(inspiration?.content || '')
    setEditingSuggestion(inspiration?.suggestion || '')
    setEditingImplementationPlan(inspiration?.implementationPlan || '')
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORIGINAL':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'BUILDING':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ACHIEVED':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ORIGINAL':
        return '原始构想'
      case 'BUILDING':
        return '筑梦中'
      case 'ACHIEVED':
        return '已达成'
      default:
        return '未知状态'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!inspiration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">灵感不存在</h2>
          <button
            onClick={() => router.push('/')}
            className="text-primary hover:text-primary/80"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </button>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">灵感详情</h1>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                编辑
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">当前状态</h3>
          <div className="flex gap-2">
            {(['ORIGINAL', 'BUILDING', 'ACHIEVED'] as string[]).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  inspiration.status === status
                    ? getStatusColor(status)
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Original Idea */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">原始灵感</h3>
          {isEditing ? (
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none"
            />
          ) : (
            <div className="prose max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap">{inspiration.content}</p>
            </div>
          )}
        </div>

        {/* AI Suggestion */}
        {inspiration.suggestion && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">AI建议的最小可实现方案</h3>
            {isEditing ? (
              <textarea
                value={editingSuggestion}
                onChange={(e) => setEditingSuggestion(e.target.value)}
                className="w-full min-h-[300px] p-3 border border-gray-300 rounded-lg resize-none"
              />
            ) : (
              <div className="prose max-w-none text-gray-800">
                <ReactMarkdown>{inspiration.suggestion}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Implementation Plan */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">灵感落地方案</h3>
          {isEditing ? (
            <textarea
              value={editingImplementationPlan}
              onChange={(e) => setEditingImplementationPlan(e.target.value)}
              className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="请填写您将如何一步步实现这个灵感..."
            />
          ) : (
            <div className="prose max-w-none text-gray-800">
              {inspiration.implementationPlan ? (
                <ReactMarkdown>{inspiration.implementationPlan}</ReactMarkdown>
              ) : (
                <p className="text-gray-500 italic">尚未填写落地方案。</p>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">详细信息</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>创建时间：</span>
              <span>{format(new Date(inspiration.createdAt), 'PPpp')}</span>
            </div>
            <div className="flex justify-between">
              <span>最后更新：</span>
              <span>{format(new Date(inspiration.updatedAt), 'PPpp')}</span>
            </div>
            <div className="flex justify-between">
              <span>所属用户：</span>
              <span>{inspiration.user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}