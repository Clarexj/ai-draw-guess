import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'sk-mttcmavvdfpvedaytluvxlvfgblrgfakhbmcoglreujlqyri';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: '未提供图片数据 | No image data provided' },
        { status: 400 }
      );
    }

    const prompt = `看这幅画，直接说出是什么，不要任何解释。格式：

中文：[答案]
English: [answer]

例如：
中文：猫
English: Cat`;

    const messages = [
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
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/QVQ-72B-Preview',
        messages: messages,
        temperature: 0.7,
        max_tokens: 200,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('无效的API响应格式');
    }

    const guess = data.choices[0].message.content;

    return NextResponse.json({ guess });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '猜测失败，请稍后重试 | Failed to guess, please try again' },
      { status: 500 }
    );
  }
}