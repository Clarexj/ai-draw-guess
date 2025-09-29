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

  const prompt = `你是一个专业的简笔画识别助手。请观察这幅画，它可能是用简单的线条画成的。

分析提示：
- 注意基本形状（圆形、方形、三角形等）
- 观察线条的排列和组合
- 考虑常见物品的简化画法
- 即使很抽象，也要大胆猜测

请直接回答画的是什么，格式如下：
中文：[你的猜测]
English: [your guess]

如果不太确定，给出最可能的答案：
中文：这看起来像是[主要猜测]，也可能是[备选答案]
English: This looks like [main guess], or possibly [alternative]`;

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
        temperature: 0.8,
        max_tokens: 150
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