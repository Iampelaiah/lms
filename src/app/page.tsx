import { LandingClient } from '@/components/landing/landing-client';

export const revalidate = 3600; // 1 hour

export default function Home() {
  return <LandingClient />;
}
