import HomePageClient from '../components/HomePageClient'

/**
 * The homepage is now a static component.
 * It renders the HomePageClient, which will handle all
 * authentication and data fetching on the client-side.
 * This approach eliminates server-side rendering delays and redirects for the landing page,
 * significantly improving the initial load performance (LCP).
 */
export default function HomePage() {
  // Pass empty/default props for the initial static render.
  // The client component will take over and fetch the real data.
  return (
    <HomePageClient
      initialInspirations={[]}
      initialIsSignedIn={false}
    />
  )
}