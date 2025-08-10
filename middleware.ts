import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define the routes that are protected and require authentication.
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/idea(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // If the route is a protected route, call auth().protect()
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};