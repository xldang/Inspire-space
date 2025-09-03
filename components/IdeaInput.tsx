'use client';

import { useState } from 'react';
import axios from 'axios';
import { Loader2, Sparkles, Check, RefreshCw } from 'lucide-react';

interface IdeaInputProps {
  onIdeaAdded: () => void;
  implementationPlan: string;
  implementationModel: string;
  isGeneratingPlan: boolean;
  handleGetImplementationPlan: () => Promise<void>;
  inspirationForPlan: string;
  setInspirationForPlan: (value: string) => void;
}

export default function IdeaInput({
  onIdeaAdded,
  implementationPlan,
  implementationModel,
  isGeneratingPlan,
  handleGetImplementationPlan,
  inspirationForPlan,
  setInspirationForPlan,
}: IdeaInputProps) {
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleSubmit = async () => {
    if (!inspirationForPlan.trim()) return;
    await handleGetImplementationPlan();
    setShowSuggestion(true);
  };

  const handleAcceptSuggestion = async () => {
    if (!implementationPlan) return;

    try {
      const response = await fetch('/api/inspirations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inspirationForPlan,
          suggestion: implementationPlan,
        }),
      });

      if (response.ok) {
        setInspirationForPlan('');
        setShowSuggestion(false);
        onIdeaAdded();
      }
    } catch (error) {
      console.error('保存灵感失败:', error);
    }
  };

  const handleRegenerate = async () => {
    if (!inspirationForPlan.trim()) return;
    await handleGetImplementationPlan();
  };

  const handleCancel = () => {
    setShowSuggestion(false);
    setInspirationForPlan('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!showSuggestion ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              💡 记录你的灵感
            </h2>
            <p className="text-gray-600">
              让AI帮你把灵感变成可实现的行动方案
            </p>
          </div>

          <div className="space-y-4">
            <textarea
              value={inspirationForPlan}
              onChange={(e) => setInspirationForPlan(e.target.value)}
              placeholder="在这里写下你的灵感想法...\n例如：我想学习一门新技能、我想做一个副业项目、我想改善我的生活习惯..."
              className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              maxLength={1000}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {inspirationForPlan.length}/1000 字符
              </span>
              
              <button
                onClick={handleSubmit}
                disabled={!inspirationForPlan.trim() || isGeneratingPlan}
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    获取实现方案
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">你的灵感</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-800">{inspirationForPlan}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              AI建议的最小可实现方案 (由 {implementationModel} 生成)
            </h3>
            <div className="prose prose-sm max-w-none text-gray-800">
              <div
                className="whitespace-pre-wrap bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100"
                dangerouslySetInnerHTML={{ __html: implementationPlan.replace(/\n/g, '<br/>') }}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleAcceptSuggestion}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4 mr-2" />
              认可方案
            </button>
            
            <button
              onClick={handleRegenerate}
              disabled={isGeneratingPlan}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
              再次思考
            </button>
            
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
