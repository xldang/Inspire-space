import type { NextApiRequest, NextApiResponse } from 'next';
import { getInspirationSuggestion } from '../../lib/openrouter';
import { prisma } from '../../lib/prisma';

// Define the default system prompt directly in this file
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

    // 从数据库获取 API Key 和 System Prompt
    let apiKeySetting = await prisma.setting.findUnique({
      where: { key: 'OPENROUTER_API_KEY' },
    });
    let systemPromptSetting = await prisma.setting.findUnique({
      where: { key: 'SYSTEM_PROMPT' },
    });
    let modelSetting = await prisma.setting.findUnique({
      where: { key: 'OPENROUTER_MODEL' },
    });

    let apiKey = apiKeySetting?.value;
    let systemPrompt = systemPromptSetting?.value;

    // 如果数据库中没有配置 API Key，则尝试从环境变量获取
    if (!apiKey) {
      apiKey = process.env.OPENROUTER_API_KEY;
    }

    // 如果仍然没有 API Key，则返回错误
    if (!apiKey) {
      console.error('OpenRouter API Key not configured in database or .env file');
      return res.status(500).json({
        success: false,
        error: 'API Key 未配置，请前往管理员设置页面进行配置或检查 .env 文件',
        suggestion: `## 最小可实现方案（本地模拟版）\n\n### 第一步：明确定义目标\n将您的灵感："${idea}" 具体化，写下清晰的目标描述和期望结果。\n\n### 第二步：制定简单计划\n将大目标分解为3-5个可以在一周内完成的小步骤。\n\n### 第三步：立即行动\n选择最简单的一步，今天就花15分钟开始执行。\n\n### 预期时间：1-2周\n### 所需资源：笔记本、手机或电脑用于记录和规划`
      });
    }

    // 如果数据库中没有配置 System Prompt，则使用默认值
    if (!systemPrompt) {
      systemPrompt = DEFAULT_SYSTEM_PROMPT;
    }

    const model = modelSetting?.value || 'anthropic/claude-3-haiku'; // Fallback to a default model

    const suggestion = await getInspirationSuggestion(idea, apiKey, systemPrompt, model);

    res.status(200).json({
      success: true,
      suggestion,
      model,
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
