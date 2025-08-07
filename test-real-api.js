require('dotenv').config();
const axios = require('axios');

async function testOpenRouterAPI() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  console.log('=== OpenRouter API 测试 ===');
  console.log('API Key exists:', !!apiKey);
  console.log('Key length:', apiKey?.length);
  
  if (!apiKey) {
    console.error('❌ API密钥未找到');
    return;
  }

  try {
    console.log('🔄 正在调用 OpenRouter API...');
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: '你是一个创意实现助手，请给出简洁的建议。'
          },
          {
            role: 'user',
            content: '我想学习编程'
          }
        ],
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      }
    );

    console.log('✅ API调用成功!');
    console.log('响应内容:', response.data.choices[0]?.message?.content);
    
  } catch (error) {
    console.error('❌ API调用失败:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('密钥无效，请检查OPENROUTER_API_KEY');
    }
  }
}

testOpenRouterAPI();