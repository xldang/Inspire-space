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
- **用户认证**: [NextAuth.js](https://next-auth.js.org/)
- **AI 服务**: [OpenRouter](https://openrouter.ai/)
- **UI**: [Lucide React](https://lucide.dev/guide/packages/lucide-react) (图标), [React Markdown](https://github.com/remarkjs/react-markdown)
- **类型检查**: [TypeScript](https://www.typescriptlang.org/)

## 🗃️ 数据模型

项目使用 Prisma 管理数据库模型，定义于 `prisma/schema.prisma`。主要包含以下模型：

-   **`User`**, **`Account`**, **`Session`**: 由 NextAuth.js 用于处理用户认证和会话管理。
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
    *   创建一个新的 "Postgres" 数据库实例并连接到您的项目。Vercel 会自动为您配置 `DATABASE_URL` 环境变量。
4.  **配置环境变量**:
    *   在项目的 "Settings" -> "Environment Variables" 中，添加以下变量：
        *   `NEXTAUTH_SECRET`: 一个用于加密 JWT 的随机字符串。你可以使用 `openssl rand -hex 32` 命令生成。
        *   `NEXTAUTH_URL`: 你的应用的线上 URL，例如 `https://your-app-name.vercel.app`。
    *   如果你想配置 OAuth 提供商 (例如 GitHub)，还需要添加对应的 `CLIENT_ID` 和 `CLIENT_SECRET`。
5.  **部署**: 保存环境变量后，Vercel 将自动开始构建和部署。
6.  **配置 OpenRouter API 密钥**:
    *   部署成功后，访问您的应用线上地址。
    *   登录后，进入后台管理页面 (`/admin/settings`)。
    *   在此页面输入并保存您的 `OpenRouter API Key`。此密钥将安全地存储在数据库的 `Setting` 表中。

### 本地开发环境配置

1.  **环境准备**:
    *   [Node.js](https://nodejs.org/en) (v20.x 或更高版本)
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

    # 2. 填入 NextAuth.js 所需的变量
    # 使用 `openssl rand -hex 32` 生成一个随机字符串
    NEXTAUTH_SECRET=
    NEXTAUTH_URL=http://localhost:3000

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

### 本地开发环境设置及问题排查

#### 常见问题及解决方案

1. **数据库连接问题**:
   - **问题**: `Can't reach database server` 或环境变量未找到
   - **解决方案**:
     - 确保 `.env.local` 文件存在且配置正确
     - 如果使用 Vercel Postgres，使用 `PRISMA_DATABASE_URL` 而不是 `DATABASE_URL`
     - 使用 `npx dotenv -e .env.local -- npx prisma db push` 来加载环境变量

2. **NextAuth 认证失败**:
   - **问题**: 登录时返回 401 Unauthorized
   - **解决方案**:
     - 确保数据库中有用户数据，可以通过 API 或直接在数据库中创建测试用户
     - 检查 `NEXTAUTH_SECRET` 和 `NEXTAUTH_URL` 配置是否正确
     - 确认开发服务器已重启以加载新的环境变量

3. **依赖安装问题**:
   - **问题**: `next` 命令找不到
   - **解决方案**: 使用 `npx next dev` 而不是 `npm run dev`

4. **数据库迁移问题**:
   - **问题**: Prisma 无法读取环境变量
   - **解决方案**: 使用 `npx dotenv -e .env.local -- npx prisma [command]` 来确保环境变量被正确加载

#### 测试账户设置

为了方便本地开发，可以创建一个测试用户：

```bash
# 在项目根目录下运行
npx dotenv -e .env.local -- node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const prisma = new PrismaClient();
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
      data: {
        name: '测试用户',
        email: 'test@example.com',
        password: hashedPassword,
      },
    });
    console.log('测试用户创建成功:', user.email);
  } catch (error) {
    console.error('创建用户失败:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

createTestUser();
"
```

**测试账户信息**:
- 邮箱: `test@example.com`
- 密码: `123456`

#### 环境变量安全说明

⚠️ **重要**: `.env.local` 文件已配置在 `.gitignore` 中，**切勿**将其提交到代码仓库。此文件包含敏感信息如数据库密码和 API 密钥。

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
