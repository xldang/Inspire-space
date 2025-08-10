'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import IdeaInput from '@/components/IdeaInput'
import IdeaCard from '@/components/IdeaCard'
import { Inspiration } from '@prisma/client'
import { Plus, Lightbulb, Calendar, CheckCircle, Settings, LogOut, LogIn } from 'lucide-react'

interface ExtendedInspiration extends Inspiration {
  user: {
    id: string;
    email: string | null;
    name: string | null;
  }
}

// Note: The initial props from the server are no longer needed as we will fetch on client-side
export default function HomePageClient() {
  const { data: session, status } = useSession();
  const [inspirations, setInspirations] = useState<ExtendedInspiration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ORIGINAL' | 'BUILDING' | 'ACHIEVED'>('ALL');

  const isSignedIn = status === 'authenticated';

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInspirations();
    } else if (status === 'unauthenticated') {
      setInspirations([]);
      setIsLoading(false);
    }
    // `status` is the dependency
  }, [status]);

  const fetchInspirations = async () => {
    if (!isSignedIn) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/inspirations');
      if (response.ok) {
        const data = await response.json();
        setInspirations(data.inspirations || []);
      } else {
        // Handle error, maybe sign out user if 401
        if (response.status === 401) {
          signOut();
        }
        console.error('获取灵感列表失败:', response.statusText);
        setInspirations([]);
      }
    } catch (error) {
      console.error('获取灵感列表失败:', error);
      setInspirations([]);
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
              ? { ...inspiration, status, updatedAt: new Date().toISOString() }
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

  if (status === 'loading' || isLoading) {
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
                <span className="text-gray-700">你好, {session.user?.name || session.user?.email}</span>
                <Link
                  href="/admin/settings"
                  title="设置"
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </Link>
                <button onClick={() => signOut()} className="text-gray-500 hover:text-primary transition-colors" title="登出">
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/signin">
                  <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors inline-flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </button>
                </Link>
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
                    -                    : 'bg-white text-gray-600 hover:bg-gray-50'
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
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
