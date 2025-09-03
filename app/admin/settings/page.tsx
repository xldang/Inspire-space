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
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">管理员设置</h1>
      <div className="space-y-8">
        {/* API and Model Settings Card */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">API 设置</h2>
          <div className="space-y-6">
            {/* API Key Section */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                OpenRouter API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="在此输入您的 API Key"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSaveApiKey}
                  disabled={isSavingApiKey}
                  className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {isSavingApiKey ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存 API Key'}
                </button>
              </div>
            </div>

            {/* Model Selection Section */}
            <div>
              <label htmlFor="modelSelect" className="block text-sm font-medium text-gray-700 mb-1">
                选择模型
              </label>
              <select
                id="modelSelect"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSaveModel}
                  disabled={isSavingModel}
                  className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {isSavingModel ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存模型'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Settings Card */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Prompt 设置</h2>
          <div className="space-y-6">
            {/* Current System Prompt Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                当前Prompt提示
              </label>
              <div className="mt-1 p-3 bg-white rounded-md border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {currentSystemPrompt || '尚未设置Prompt提示。'}
              </div>
            </div>
            {/* Edit System Prompt Section */}
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                编辑Prompt提示
              </label>
              <textarea
                id="systemPrompt"
                value={systemPromptInput}
                onChange={(e) => setSystemPromptInput(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-mono"
                placeholder="在此输入新的系统提示"
                rows={12}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSaveSystemPrompt}
                  disabled={isSavingSystemPrompt}
                  className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {isSavingSystemPrompt ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存系统提示'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 bg-gray-100 rounded-md p-3 inline-block">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
