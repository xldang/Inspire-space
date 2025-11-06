'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6 container mx-auto px-4 py-4">
          <Link href="/" className="block">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-0">
                ✨ 灵感空间
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-gray-700">你好, {session.user?.name || session.user?.email}</span>
                <button onClick={() => signOut()} className="text-gray-500 hover:text-primary transition-colors" title="登出">
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
