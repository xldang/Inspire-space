import type { NextApiRequest, NextApiResponse } from 'next';
import { getInspirationSuggestion } from '../../lib/openrouter';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    const { idea } = req.body;

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      return res.status(400).json({ error: '灵感内容不能为空' });
    }

    if (idea.length > 1000) {
      return res.status(400).json({ error: '灵感内容过长，请控制在1000字以内' });
    }

    // 从数据库获取 API Key
    const apiKeySetting = await prisma.setting.findUnique({
      where: { key: 'OPENROUTER_API_KEY' },
    });

    if (!apiKeySetting || !apiKeySetting.value) {
      console.error('OpenRouter API Key not configured in database');
      return res.status(500).json({
        success: false,
        error: 'API Key 未配置，请前往管理员设置页面进行配置',
        suggestion: `## 最小可实现方案（本地模拟版）\n\n### 第一步：明确定义目标\n将您的灵感："${idea}" 具体化，写下清晰的目标描述和期望结果。\n\n### 第二步：制定简单计划\n将大目标分解为3-5个可以在一周内完成的小步骤。\n\n### 第三步：立即行动\n选择最简单的一步，今天就花15分钟开始执行。\n\n### 预期时间：1-2周\n### 所需资源：笔记本、手机或电脑用于记录和规划`
      });
    }

    const suggestion = await getInspirationSuggestion(idea, apiKeySetting.value);

    res.status(200).json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error('API 处理错误:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '处理请求时发生错误',
      suggestion: `## 最小可实现方案（临时方案）\n\n### 第一步：明确定义目标\n将您的灵感："${req.body?.idea || '未提供'}" 具体化，写下清晰的目标描述和期望结果。\n\n### 第二步：制定简单计划\n将大目标分解为3-5个可以在一周内完成的小步骤。\n\n### 第三步：立即行动\n选择最简单的一步，今天就花15分钟开始执行。\n\n### 预期时间：1-2周\n### 所需资源：笔记本、手机或电脑用于记录和规划`
    });
  }
}