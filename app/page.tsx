import HomePageClient from '@/components/HomePageClient';

export default function HomePage() {
  // The HomePageClient component now handles all its own data fetching
  // and authentication state via the useSession hook.
  // This simplifies the server component significantly.
  return <HomePageClient />;
}
