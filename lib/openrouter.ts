
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function getInspirationSuggestion(idea: string, apiKey: string, systemPrompt: string, model: string): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenRouter API Key 未提供');
  }

  try {
    console.log(`调用 OpenRouter API (模型: ${model})...`);
    
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
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `${systemPrompt}\\n\\nUser Inspiration:\\n${idea}`
          }
        ],
        max_tokens: 2000,
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
