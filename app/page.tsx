import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import HomePageClient from '../components/HomePageClient'
import { Inspiration } from '@prisma/client'

// Define the extended type for inspirations, including user info
interface ExtendedInspiration extends Inspiration {
  user: {
    clerkId: string
    email: string
  }
}

/**
 * This page now uses a hybrid rendering approach for optimal performance.
 * - For logged-out users (and search engines), it's a static shell.
 * - For logged-in users, it's server-side rendered (SSR) with their data.
 * This eliminates the client-side data fetching waterfall for logged-in users,
 * dramatically improving the Largest Contentful Paint (LCP) on all devices, especially mobile.
 */
export default async function HomePage() {
  const { userId } = auth()
  const isSignedIn = !!userId

  let inspirations: ExtendedInspiration[] = []

  // If the user is signed in, fetch their data on the server.
  if (isSignedIn) {
    try {
      inspirations = await prisma.inspiration.findMany({
        where: {
          userId,
        },
        include: {
          user: {
            select: {
              clerkId: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }) as ExtendedInspiration[];
    } catch (error) {
      console.error('Server-side fetch for inspirations failed:', error)
      // In case of a database error, we'll fall back to client-side fetching.
      inspirations = [];
    }
  }

  // Pass the server-fetched data (or an empty array) to the client component.
  return (
    <HomePageClient
      initialInspirations={inspirations}
      initialIsSignedIn={isSignedIn}
    />
  )
}
