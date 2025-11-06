'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const DEFAULT_SYSTEM_PROMPT = `你是一个创意实现助手。请为用户提供的灵感想法提供一个最小可实现的行动方案。
            要求：
            1. 方案必须具体、可操作
            2. 使用清晰的步骤格式
            3. 考虑时间和资源限制
            4. 用中文回复
            5. 保持简洁但完整
            
            格式：
            ## 最小可实现方案
            
            ### 第一步：[具体行动]
            [详细说明]
            
            ### 第二步：[具体行动]
            [详细说明]
            
            ### 第三步：[具体行动]
            [详细说明]
            
            ### 预期时间：[时间估算]
            ### 所需资源：[所需工具/材料]`;

export default function AdminSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [currentSystemPrompt, setCurrentSystemPrompt] = useState('');
  const [systemPromptInput, setSystemPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [isSavingSystemPrompt, setIsSavingSystemPrompt] = useState(false);
  // New state for model selection
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([
    'x-ai/grok-code-fast-1',
    'anthropic/claude-sonnet-4',
    'google/gemini-2.5-flash',
    'deepseek/deepseek-chat-v3-0324',
    'deepseek/deepseek-chat-v3.1',
    'qwen/qwen3-coder',
    'anthropic/claude-3.7-sonnet',
    'openai/gpt-5',
    'google/gemini-2.5-flash-lite',
    'deepseek/deepseek-r1-0528:free',
    'openai/gpt-4.1-mini',
    'mistralai/mistral-nemo',
    'deepseek/deepseek-chat-v3-0324:free',
    'openai/gpt-4o-mini',
    'openai/gpt-oss-120b',
    'z-ai/glm-4.5',
    'openai/gpt-4.1',
  ]);
  const [isSavingModel, setIsSavingModel] = useState(false); // State for saving model
  const [message, setMessage] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    
    if (status === 'authenticated') {
      setIsLoading(true);
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          const apiKeySetting = data.find((s: any) => s.key === 'OPENROUTER_API_KEY');
          const systemPromptSetting = data.find((s: any) => s.key === 'SYSTEM_PROMPT');
          const modelSetting = data.find((s: any) => s.key === 'OPENROUTER_MODEL'); // Fetch current model setting

          if (apiKeySetting) {
            setApiKey(apiKeySetting.value);
          }
          
          const currentPrompt = systemPromptSetting?.value || DEFAULT_SYSTEM_PROMPT;
          setCurrentSystemPrompt(currentPrompt);
          setSystemPromptInput(currentPrompt);

          if (modelSetting) {
            setSelectedModel(modelSetting.value); // Set selected model
          } else {
            // Ensure availableModels is not empty before accessing index 0
            if (availableModels.length > 0) {
              setSelectedModel(availableModels[0]); // Set default model if not found
            }
          }

          setIsLoading(false);
        })
        .catch(() => {
          setMessage('获取设置失败');
          setIsLoading(false);
        });
    }
  }, [status, router, availableModels]); // Added availableModels to dependency array


  const handleSaveApiKey = async () => {
    setMessage('');
    setIsSavingApiKey(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ key: 'OPENROUTER_API_KEY', value: apiKey }]),
      });

      if (res.ok) {
        setMessage('API Key 保存成功！');
      } else {
        const errorData = await res.json();
        setMessage(`保存失败: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('保存失败: 网络错误');
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const handleSaveSystemPrompt = async () => {
    setMessage('');
    setIsSavingSystemPrompt(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ key: 'SYSTEM_PROMPT', value: systemPromptInput }]),
      });

      if (res.ok) {
        setMessage('系统提示保存成功！');
        setCurrentSystemPrompt(systemPromptInput);
        setSystemPromptInput(systemPromptInput); // Also update the input state
      } else {
        const errorData = await res.json();
        setMessage(`保存失败: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('保存失败: 网络错误');
    } finally {
      setIsSavingSystemPrompt(false);
    }
  };

  // Handler for saving the selected model
  const handleSaveModel = async () => {
    setMessage('');
    setIsSavingModel(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ key: 'OPENROUTER_MODEL', value: selectedModel }]),
      });

      if (res.ok) {
        setMessage('模型保存成功！');
      } else {
        const errorData = await res.json();
        setMessage(`保存失败: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('保存失败: 网络错误');
    } finally {
      setIsSavingModel(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">管理员设置</h1>
        <p className="text-gray-600">管理系统配置和AI模型设置</p>
      </div>

      {/* API Settings Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">API 设置</h2>
            <p className="text-sm text-gray-600">配置AI服务和模型参数</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* API Key Section */}
          <div className="space-y-3">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                OpenRouter API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="输入您的API Key"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveApiKey}
                disabled={isSavingApiKey}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingApiKey ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isSavingApiKey ? '保存中...' : '保存 API Key'}
              </button>
            </div>
          </div>

          {/* Model Selection Section */}
          <div className="space-y-3">
            <div>
              <label htmlFor="modelSelect" className="block text-sm font-medium text-gray-700 mb-2">
                AI 模型选择
              </label>
              <select
                id="modelSelect"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveModel}
                disabled={isSavingModel}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingModel ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isSavingModel ? '保存中...' : '保存模型'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Settings Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Prompt 设置</h2>
            <p className="text-sm text-gray-600">自定义AI助手的系统提示词</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              当前系统提示词
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                {currentSystemPrompt || '尚未设置系统提示词。'}
              </pre>
            </div>
          </div>

          {/* Edit System Prompt */}
          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-3">
              编辑系统提示词
            </label>
            <textarea
              id="systemPrompt"
              value={systemPromptInput}
              onChange={(e) => setSystemPromptInput(e.target.value)}
              className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm resize-vertical min-h-[200px]"
              placeholder="输入新的系统提示词..."
              rows={12}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveSystemPrompt}
                disabled={isSavingSystemPrompt}
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isSavingSystemPrompt ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isSavingSystemPrompt ? '保存中...' : '保存系统提示词'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className="max-w-md mx-auto">
          <div className={`text-center p-4 rounded-lg ${
            message.includes('成功') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
