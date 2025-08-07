// 测试 OpenRouter API 调用
const axios = require('axios');

const testAPI = async () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('API Key exists:', !!apiKey);
  
  if (!apiKey) {
    console.log('No API key found');
    return;
  }

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'anthropic/claude-3-haiku',
      messages: [
        {
          role: 'user',
          content: '测试一下这个API是否工作正常'
        }
      ],
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('API Response:', response.data.choices[0]?.message?.content);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
};

testAPI();