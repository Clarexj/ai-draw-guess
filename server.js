// 加载环境变量（如果有dotenv模块）
try {
    require('dotenv').config();
} catch (e) {
    // 如果没有安装dotenv，使用默认值
}

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 从环境变量读取API密钥
const API_KEY = process.env.SILICONFLOW_API_KEY;

if (!API_KEY) {
    console.error('❌ 错误：未找到API密钥！');
    console.log('请按以下步骤操作：');
    console.log('1. 复制 .env.example 文件为 .env');
    console.log('2. 在 .env 文件中填入你的API密钥');
    console.log('3. 重新运行 node server.js');
    process.exit(1);
}
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 提供HTML文件
    if (pathname === '/' || pathname === '/index.html') {
        // 检测是否是移动设备
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);

        // 根据设备类型选择不同的页面
        const htmlFile = isMobile ? 'mobile.html' : 'ai-draw-guess.html';
        const htmlPath = path.join(__dirname, htmlFile);

        try {
            const html = fs.readFileSync(htmlPath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } catch (error) {
            res.writeHead(404);
            res.end('File not found');
        }
        return;
    }

    // 支持直接访问各个HTML文件
    if (pathname.endsWith('.html')) {
        const htmlFile = pathname.substring(1); // 移除开头的 /
        const htmlPath = path.join(__dirname, htmlFile);

        try {
            const html = fs.readFileSync(htmlPath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } catch (error) {
            res.writeHead(404);
            res.end('File not found');
        }
        return;
    }

    // 处理API请求
    if (pathname === '/api/guess' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { imageData } = JSON.parse(body);

                if (!imageData) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '未提供图片数据' }));
                    return;
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
                    const errorText = await response.text();
                    console.error('API Error:', errorText);
                    throw new Error(`API请求失败: ${response.status}`);
                }

                const data = await response.json();

                if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                    throw new Error('无效的API响应格式');
                }

                const guess = data.choices[0].message.content;

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ guess }));

            } catch (error) {
                console.error('Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: '猜测失败，请稍后重试 | Failed to guess, please try again',
                    details: error.message
                }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`
========================================
🎨 AI你画我猜游戏已启动！
🌐 请在浏览器中访问: http://localhost:${PORT}
========================================
    `);
});