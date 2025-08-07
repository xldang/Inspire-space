# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 提供在此代码库中工作的指导。

## 项目概览

**灵感空间（Inspire Space）** - 一个基于 Next.js 的应用程序，帮助用户记录并实现他们的灵感想法。用户可以输入创意想法，通过 OpenRouter API 获取 AI 驱动的可执行建议，并跟踪不同阶段的进展。

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **样式**: Tailwind CSS
- **数据库**: Prisma ORM + SQLite
- **认证**: Clerk (邮箱验证码登录)
- **API集成**: OpenRouter API 获取 AI 建议
- **HTTP客户端**: Axios

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 数据库
npx prisma generate  # 生成 Prisma 客户端
npx prisma db push   # 推送架构变更到数据库
npx prisma studio    # 打开 Prisma Studio 管理数据库

# 代码质量
npm run lint         # 运行 ESLint
npm run type-check   # 运行 TypeScript 类型检查
```

## 项目结构

```
app/                 # Next.js App Router 页面
├── page.tsx         # 首页，包含灵感输入和列表
├── idea/[id]/       # 灵感详情页面
├── globals.css      # 全局样式
├── layout.tsx       # 根布局，包含 Clerk 提供者

components/          # 可复用的 React 组件
├── IdeaInput.tsx    # 多行灵感输入组件
├── IdeaCard.tsx     # 灵感展示卡片组件

lib/                 # 工具函数和配置
├── openrouter.ts    # OpenRouter API 集成
├── prisma.ts        # Prisma 客户端单例

prisma/              # 数据库架构和迁移
└── schema.prisma    # 用户、灵感、状态模型

pages/api/           # API 路由
└── parse-idea.ts    # 后端 API，处理 AI 建议
```

## 核心功能

1. **认证系统**: 基于 Clerk 的邮箱验证登录
2. **灵感输入**: 多行文本输入新想法
3. **AI处理**: 通过 OpenRouter API 自动生成可执行建议
4. **状态跟踪**: 灵感进展阶段："原始构想" → "筑梦中" → "已达成"
5. **详情页面**: 单个灵感详情视图，可编辑状态
6. **响应式设计**: 兼容手机和桌面

## 数据库架构

- **用户**: Clerk 管理的用户数据
- **灵感**: 存储原始想法、AI建议、当前状态
- **状态**: 枚举类型，跟踪灵感进展阶段

## 环境变量

需要配置的 `.env.local` 变量：
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `OPENROUTER_API_KEY`
- `DATABASE_URL` (SQLite 文件路径)

## 关键集成点

1. **OpenRouter API**: POST 请求获取 AI 建议
2. **Clerk 认证**: 用户认证和会话管理
3. **Prisma**: 灵感和用户数据的数据库操作
4. **Next.js API 路由**: AI 调用的后端处理