'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, ChevronRight, Edit3 } from 'lucide-react';

interface Inspiration {
  id: string;
  content: string;
  suggestion: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IdeaCardProps {
  inspiration: Inspiration;
  onStatusChange: (id: string, status: string) => void;
}

export default function IdeaCard({ inspiration, onStatusChange }: IdeaCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORIGINAL':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'BUILDING':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ACHIEVED':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ORIGINAL':
        return '原始构想';
      case 'BUILDING':
        return '筑梦中';
      case 'ACHIEVED':
        return '已达成';
      default:
        return '未知状态';
    }
  };

  const formatContent = (content: string) => {
    if (content.length > 80) {
      return content.substring(0, 80) + '...';
    }
    return content;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {formatContent(inspiration.content)}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Clock className="w-4 h-4" />
            <span>
              {formatDistanceToNow(new Date(inspiration.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(inspiration.status)}`}>
            {getStatusText(inspiration.status)}
          </span>
        </div>
      </div>

      {inspiration.suggestion && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">AI建议摘要</h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {inspiration.suggestion.substring(0, 100)}...
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {inspiration.status !== 'ORIGINAL' && (
            <button
              onClick={() => onStatusChange(inspiration.id, 'ORIGINAL')}
              className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
            >
              回到构想
            </button>
          )}
          {inspiration.status !== 'BUILDING' && (
            <button
              onClick={() => onStatusChange(inspiration.id, 'BUILDING')}
              className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
            >
              开始筑梦
            </button>
          )}
          {inspiration.status !== 'ACHIEVED' && (
            <button
              onClick={() => onStatusChange(inspiration.id, 'ACHIEVED')}
              className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded"
            >
              标记达成
            </button>
          )}
        </div>

        <a
          href={`/idea/${inspiration.id}`}
          className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
        >
          查看详情
          <ChevronRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}