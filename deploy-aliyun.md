# 阿里云部署指南

## 方案1：使用阿里云函数计算（最简单）

1. 登录阿里云函数计算控制台
2. 创建新应用
3. 选择 Node.js 环境
4. 上传代码包
5. 绑定域名 clare-ai.fun

## 方案2：使用阿里云 ECS（更灵活）

### 1. 购买 ECS 服务器
- 选择：轻量应用服务器（便宜）
- 系统：Ubuntu 22.04
- 配置：2核2G即可

### 2. 安装环境
```bash
# 连接服务器
ssh root@你的服务器IP

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2
```

### 3. 部署代码
```bash
# 克隆代码
git clone https://github.com/clarexj/ai-draw-guess.git
cd ai-draw-guess

# 安装依赖
npm install

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start npm --name "ai-draw-guess" -- start
pm2 save
pm2 startup
```

### 4. 配置 Nginx
```bash
# 安装 Nginx
sudo apt-get install nginx

# 配置反向代理
sudo nano /etc/nginx/sites-available/clare-ai.fun
```

Nginx 配置内容：
```nginx
server {
    listen 80;
    server_name clare-ai.fun www.clare-ai.fun;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/clare-ai.fun /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. 配置 SSL（可选）
```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d clare-ai.fun -d www.clare-ai.fun
```

## 方案3：使用 Serverless（阿里云 FC）

最适合你的场景，按量付费，访问量小时几乎免费。

### 步骤：
1. 安装 Serverless Devs 工具
2. 配置阿里云密钥
3. 一键部署

详细文档：https://help.aliyun.com/document_detail/195474.html

## 环境变量配置

无论哪种方案，记得配置：
```
OPENAI_API_KEY=你的密钥
```

## 域名解析

在阿里云域名控制台：
- A 记录 @ → 你的服务器IP
- A 记录 www → 你的服务器IP