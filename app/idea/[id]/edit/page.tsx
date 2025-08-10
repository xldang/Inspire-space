'use client'

import { useState, useEffect } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Inspiration } from '@prisma/client';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function IdeaEditPage() {
  const { id } = useParams() as { id: string };
  const { data: session, status } = useSession();
  const router = useRouter();

  const [inspiration, setInspiration] = useState<Inspiration | null>(null);
  const [content, setContent] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [implementationPlan, setImplementationPlan] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const fetchInspiration = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/inspirations/${id}`);
          if (response.status === 404) {
            notFound();
            return;
          }
          if (!response.ok) {
            throw new Error('获取灵感详情失败');
          }
          const data = await response.json();
          const fetchedInspiration = data.inspiration;
          setInspiration(fetchedInspiration);
          setContent(fetchedInspiration.content);
          setSuggestion(fetchedInspiration.suggestion || '');
          setImplementationPlan(fetchedInspiration.implementationPlan || '');
        } catch (err) {
          setError(err instanceof Error ? err.message : '未知错误');
        } finally {
          setIsLoading(false);
        }
      };
      fetchInspiration();
    }
  }, [id, status, router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/inspirations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          suggestion,
          implementationPlan,
        }),
      });

      if (!response.ok) {
        throw new Error('保存失败，请稍后重试');
      }
      
      router.push(`/idea/${id}`);
      router.refresh(); 
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存过程中发生未知错误');
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>错误：{error}</p>
        <Link href={`/idea/${id}`} className="text-primary hover:underline mt-4 inline-block">
          返回详情页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/idea/${id}`}
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          取消编辑
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">编辑灵感</h1>

        <div className="space-y-6">
          <section>
            <label htmlFor="content" className="text-xl font-semibold text-gray-800 block mb-2">
              原始想法
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
              rows={5}
            />
          </section>

          <section>
            <label htmlFor="suggestion" className="text-xl font-semibold text-gray-800 block mb-2">
              AI 初步建议
            </label>
            <textarea
              id="suggestion"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
              rows={8}
            />
          </section>

          <section>
            <label htmlFor="implementationPlan" className="text-xl font-semibold text-gray-800 block mb-2">
              灵感落地方案
            </label>
            <textarea
              id="implementationPlan"
              value={implementationPlan}
              onChange={(e) => setImplementationPlan(e.target.value)}
              className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
              rows={8}
            />
          </section>
        </div>

        <div className="mt-10 border-t pt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-primary/50 transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {isSaving ? '保存中...' : '保存更改'}
          </button>
        </div>
      </div>
    </div>
  );
}