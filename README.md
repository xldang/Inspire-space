# 灵感空间 - Inspire Space

一个帮助用户记录和实现灵感的 Next.js 应用。通过 AI 智能分析，将创意想法转化为可执行的行动方案。

## 🌟 功能特点

- **灵感记录**: 简洁优雅的多行输入界面
- **AI 智能分析**: 自动将灵感转化为最小可执行方案
- **状态跟踪**: 从"原始构想"到"筑梦中"再到"已达成"的完整流程
- **响应式设计**: 完美适配手机和桌面设备
- **用户认证**: 基于 Clerk 的邮箱验证登录
- **数据管理**: 使用 Prisma + SQLite 的可靠数据存储

## 🚀 快速开始

### 环境准备

1. 克隆项目
2. 安装依赖：
   ```bash
   npm install
   ```

3. 复制环境变量模板：
   ```bash
   cp .env.example .env.local
   ```

4. 配置环境变量：
   - 在 `.env.local` 中填写 Clerk 和 OpenRouter 的 API 密钥
   - 确保 `DATABASE_URL` 指向正确的 SQLite 文件路径

### 数据库初始化

```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库和表
npx prisma db push

# （可选）打开 Prisma Studio 管理数据
npx prisma studio
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **数据库**: Prisma ORM + SQLite
- **认证**: Clerk
- **AI API**: OpenRouter API
- **HTTP 客户端**: Axios
- **图标**: Lucide React

## 📱 项目结构

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页
│   ├── idea/[id]/         # 灵感详情页
│   ├── api/               # API 路由
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── IdeaInput.tsx      # 灵感输入组件
│   └── IdeaCard.tsx       # 灵感卡片组件
├── lib/                   # 工具函数
│   ├── prisma.ts          # Prisma 客户端
│   └── openrouter.ts      # OpenRouter API 集成
├── prisma/                # 数据库配置
│   └── schema.prisma      # 数据模型定义
└── pages/api/             # 传统 API 路由
    └── parse-idea.ts      # AI 建议处理 API
```

## 🔧 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

## 📊 数据模型

### Inspiration（灵感）
- `id`: 唯一标识符
- `content`: 原始灵感内容
- `suggestion`: AI 生成的实现建议
- `status`: 当前状态（原始构想/筑梦中/已达成）
- `userId`: 关联用户ID
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### User（用户）
- `clerkId`: Clerk 用户ID
- `email`: 用户邮箱
- `name`: 用户名
- 关联多个灵感记录

## 🎨 设计特色

- **渐变背景**: 使用柔和的蓝紫渐变营造灵感氛围
- **卡片设计**: 清晰的信息层次和视觉反馈
- **动画效果**: 流畅的过渡和加载动画
- **响应式布局**: 完美适配各种屏幕尺寸
- **状态色彩**: 直观的状态标识系统

## 🔒 安全配置

- 使用 Clerk 进行用户认证
- 所有 API 路由都经过身份验证
- 用户只能访问自己的数据
- 输入验证和长度限制

## 🚀 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

### 环境变量配置

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENROUTER_API_KEY=
DATABASE_URL="file:./prod.db"
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
