export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageData } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: '未提供图片数据' });
  }

  // API密钥从环境变量读取（在Vercel设置）
  const API_KEY = process.env.SILICONFLOW_API_KEY || 'sk-mttcmavvdfpvedaytluvxlvfgblrgfakhbmcoglreujlqyri';
  const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

  const prompt = `请仔细观察这幅简笔画，猜测画的是什么。即使画得很简单，也请给出你的最佳猜测。

请用以下格式回答：
中文：[你的猜测]
English: [your guess]

如果实在看不出来，可以说：
中文：这可能是...（给出几个可能的答案）
English: This might be...`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "Qwen/QVQ-72B-Preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const guess = data.choices[0].message.content;
      return res.status(200).json({ guess });
    } else {
      return res.status(500).json({ error: 'AI未能识别图片' });
    }
  } catch (error) {
    console.error('API调用失败:', error);
    return res.status(500).json({ error: '服务暂时不可用' });
  }
}