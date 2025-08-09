
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function getInspirationSuggestion(idea: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenRouter API Key 未提供');
  }

  try {
    console.log('调用 OpenRouter API...');
    
    // 使用原生 fetch 替代 axios 以避免代理问题
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://inspire-space.vercel.app',
        'X-Title': 'InspireSpace',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: `你是一个创意实现助手。请为用户提供的灵感想法提供一个最小可实现的行动方案。
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
            ### 所需资源：[所需工具/材料]`
          },
          {
            role: 'user',
            content: `请为以下灵感提供最小可实现方案：${idea}`
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as OpenRouterResponse;
    const suggestion = data.choices[0]?.message?.content;
    
    if (!suggestion) {
      throw new Error('未能获取 AI 建议');
    }

    console.log('API调用成功，返回建议长度:', suggestion.length);
    return suggestion;
  } catch (error) {
    console.error('OpenRouter API 调用失败:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('API密钥无效，请检查配置');
      } else if (error.message.includes('429')) {
        throw new Error('API调用频率限制，请稍后再试');
      } else if (error.message.includes('ECONNREFUSED')) {
        throw new Error('网络连接失败，请检查网络');
      }
    }
    
    throw new Error(`API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}