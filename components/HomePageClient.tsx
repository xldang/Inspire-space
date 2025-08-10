'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import IdeaInput from '@/components/IdeaInput'
import IdeaCard from '@/components/IdeaCard'
import { Inspiration } from '@prisma/client'
import { Plus, Lightbulb, Calendar, CheckCircle, Settings } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface ExtendedInspiration extends Inspiration {
  user: {
    clerkId: string
    email: string
  }
}

interface HomePageClientProps {
  initialInspirations: ExtendedInspiration[];
  initialIsSignedIn: boolean;
}

export default function HomePageClient({
  initialInspirations,
  initialIsSignedIn,
}: HomePageClientProps) {
  const { user, isSignedIn: clerkIsSignedIn } = useUser();
  const [inspirations, setInspirations] = useState<ExtendedInspiration[]>(initialInspirations);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ORIGINAL' | 'BUILDING' | 'ACHIEVED'>('ALL');

  // Sync state with server-fetched props
  useEffect(() => {
    setInspirations(initialInspirations);
  }, [initialInspirations]);

  // Use the initialIsSignedIn prop, and update if Clerk's state changes
  const [isSignedIn, setIsSignedIn] = useState(initialIsSignedIn);
  useEffect(() => {
    if (typeof clerkIsSignedIn === 'boolean') {
      setIsSignedIn(clerkIsSignedIn);
    }
  }, [clerkIsSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      fetchInspirations();
    } else {
      setInspirations([]); // Clear data on sign-out
    }
  }, [isSignedIn]);

  const fetchInspirations = async () => {
    if (!isSignedIn) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/inspirations');
      const data = await response.json();
      setInspirations(data.inspirations || []);
    } catch (error) {
      console.error('获取灵感列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdeaAdded = () => {
    fetchInspirations();
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/inspirations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setInspirations((prev) =>
          prev.map((inspiration) =>
            inspiration.id === id
              ? { ...inspiration, status, updatedAt: new Date() }
              : inspiration
          )
        );
      }
    } catch (error) {
      console.error('更新灵感状态失败:', error);
    }
  };

  const filteredInspirations = inspirations.filter((inspiration) => {
    if (filter === 'ALL') return true;
    return inspiration.status === filter;
  });

  const stats = {
    total: inspirations.length,
    original: inspirations.filter((i) => i.status === 'ORIGINAL').length,
    building: inspirations.filter((i) => i.status === 'BUILDING').length,
    achieved: inspirations.filter((i) => i.status === 'ACHIEVED').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ✨ 灵感空间
            </h1>
            <p className="text-gray-600 text-lg">
              记录并实现你的每一个灵感
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link
                  href="/admin/settings"
                  title="设置"
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </Link>
                <UserButton />
              </>
            ) : (
              <div className="flex gap-2">
                <SignInButton>
                  <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors">
                    登录
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    注册
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {isSignedIn && inspirations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-600">总灵感</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">构想中</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.original}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Plus className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">进行中</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.building}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">已达成</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.achieved}</p>
            </div>
          </div>
        )}
      </header>

      <div className="space-y-8">
        {/* Inspiration Input */}
        {isSignedIn && (
          <section className="animate-fade-in">
            <IdeaInput onIdeaAdded={handleIdeaAdded} />
          </section>
        )}

        {/* Filter Tabs */}
        {isSignedIn && inspirations.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {[{
              value: 'ALL',
              label: '全部',
              count: stats.total
            },
            {
              value: 'ORIGINAL',
              label: '原始构想',
              count: stats.original
            },
            {
              value: 'BUILDING',
              label: '筑梦中',
              count: stats.building
            },
            {
              value: 'ACHIEVED',
              label: '已达成',
              count: stats.achieved
            },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === tab.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        )}

        {/* Inspirations List */}
        {isSignedIn ? (
          <section className="space-y-4">
            {filteredInspirations.length > 0 ? (
              <div className="grid gap-4">
                {filteredInspirations.map((inspiration) => (
                  <IdeaCard
                    key={inspiration.id}
                    inspiration={inspiration}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {inspirations.length === 0 ? '开始记录你的第一个灵感' : '没有符合条件的灵感'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {inspirations.length === 0 
                      ? '每一个伟大的想法都始于一个小小的灵感，现在就开始吧！'
                      : '尝试调整筛选条件或添加新的灵感。'
                    }
                  </p>
                </div>
              </div>
            )}
          </section>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                欢迎加入灵感空间
              </h2>
              <p className="text-gray-600 mb-8">
                登录后开始记录你的灵感，让AI帮你把想法变成现实。
              </p>
              <div className="flex gap-4 justify-center">
                <SignInButton>
                  <button className="px-6 py-3 text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors">
                    登录账号
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    免费注册
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
