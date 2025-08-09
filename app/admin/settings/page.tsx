'use client'

import { useState, useEffect } from 'react'
import { SignedIn, useUser } from '@clerk/nextjs'

export default function AdminSettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const { isSignedIn } = useUser()

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.value) {
            setApiKey(data.value)
          }
          setIsLoading(false)
        })
    }
  }, [isSignedIn])

  const handleSave = async () => {
    setMessage('')
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: 'OPENROUTER_API_KEY', value: apiKey }),
    })

    if (res.ok) {
      setMessage('API Key 保存成功！')
    } else {
      const errorData = await res.json()
      setMessage(`保存失败: ${errorData.error}`)
    }
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  return (
    <SignedIn>
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">管理员设置</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              OpenRouter API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="在此输入您的 API Key"
            />
          </div>
          <button
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            保存
          </button>
          {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
        </div>
      </div>
    </SignedIn>
  )
}
