import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: ['/'],
});

export const config = {
  matcher: [
    // 匹配所有路由，除了静态文件
    '/((?!.+\\.[\\w]+$|_next).*)/',
    '/',
    '/(api|trpc)(.*)',
  ],
};
