# Inspire Space - 灵感空间

一个基于 Next.js 和 AI 的智能灵感管理平台，旨在帮助用户捕捉、分析、孵化和实践自己的创意。

## ✨ 项目简介

“灵感空间”是一个全栈 Web 应用，它不仅能让用户随时记录脑海中闪现的灵感火花，还能通过 AI 智能分析，将这些抽象的想法具象化为可执行的步骤或建议。项目旨在打造一个从灵感诞生到最终实现的完整闭环，帮助用户更好地管理和孵化自己的创意。

本项目已配置为通过连接到 GitHub 仓库，实现 Vercel 平台的自动化持续部署。

## 🛠️ 技术栈

- **前端**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **后端**: Next.js (App & Pages API Routes)
- **数据库**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **用户认证**: [Clerk](https://clerk.com/)
- **AI 服务**: [OpenRouter](https://openrouter.ai/)
- **UI**: [Lucide React](https://lucide.dev/guide/packages/lucide-react) (图标), [React Markdown](https://github.com/remarkjs/react-markdown)
- **类型检查**: [TypeScript](https://www.typescriptlang.org/)

## 🗃️ 数据模型

项目使用 Prisma 管理数据库模型，定义于 `prisma/schema.prisma`。主要包含三个模型：

-   **`User`**: 存储用户信息，通过 `clerkId` 与 Clerk 服务关联。
-   **`Inspiration`**: 存储灵感的核心数据。
    -   `content`: 原始灵感内容。
    -   `suggestion`: AI 生成的初步建议。
    -   `implementationPlan`: AI 生成的详细执行方案。
    -   `status`: 灵感状态 (`ORIGINAL`, `BUILDING`, `ACHIEVED`)。
-   **`Setting`**: 用于存储键值对形式的应用级配置，例如 API 密钥。

## 🚀 部署与配置

本项目推荐使用 [Vercel](https://vercel.com/) 进行一键部署。

### Vercel 部署

1.  **Fork 仓库**: 将本项目 Fork 到您自己的 GitHub 账户。
2.  **导入项目**: 登录 Vercel，从您的 GitHub 仓库导入该项目。
3.  **连接数据库**:
    *   在 Vercel 的项目仪表盘中，进入 "Storage" 标签页。
    *   创建一个新的 "Postgres" 数据库实例并连接到您的项目。Vercel 会自动为您配置所有相关的数据库环境变量。
4.  **配置 Clerk 密钥**:
    *   在项目的 "Settings" -> "Environment Variables" 中，添加以下两个必需的 Clerk 密钥：
        *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
        *   `CLERK_SECRET_KEY`
5.  **部署**: 保存环境变量后，Vercel 将自动开始构建和部署。
6.  **配置 OpenRouter API 密钥**:
    *   部署成功后，访问您的应用线上地址。
    *   登录后，进入后台管理页面 (`/admin/settings`)。
    *   在此页面输入并保存您的 `OpenRouter API Key`。此密钥将安全地存储在数据库的 `Setting` 表中。

### 本地开发环境配置

1.  **环境准备**:
    *   [Node.js](https://nodejs.org/en) (v20.x 或更高版本)
    *   [pnpm](https://pnpm.io/installation) (或 npm/yarn)
    *   一个本地或远程的 [PostgreSQL](https://www.postgresql.org/download/) 数据库实例。

2.  **安装与配置**:
    ```bash
    # 克隆仓库
    git clone https://github.com/your-username/inspire-space.git
    cd inspire-space

    # 安装依赖
    npm install

    # 复制环境变量文件
    cp .env.example .env.local
    ```

3.  **编辑 `.env.local` 文件**:
    ```env
    # 1. 填入你的 PostgreSQL 数据库连接字符串
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

    # 2. 填入从 Clerk Dashboard 获取的开发密钥
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=

    # 3. 填入你的 OpenRouter API 密钥
    OPENROUTER_API_KEY=
    ```

4.  **数据库迁移**:
    ```bash
    # 生成 Prisma Client
    npx prisma generate

    # 将数据模型同步到数据库，创建表结构
    npx prisma db push
    ```

5.  **启动项目**:
    ```bash
    npm run dev
    ```
    应用将在 [http://localhost:3000](http://localhost:3000) 上运行。

## 🔧 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行 ESLint 代码检查
npm run lint

# 运行 TypeScript 类型检查
npm run type-check
```