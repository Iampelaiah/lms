import { FeaturesCarousel } from '@/components/app/landing/features-carousel';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="#" className="flex items-center gap-2 font-bold" prefetch={false}>
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg">LearnetIQ</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-4 sm:flex">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              prefetch={false}
            >
              Features
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              prefetch={false}
            >
              Statistics
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              prefetch={false}
            >
              Testimonials
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-4 sm:ml-4">
            <Button asChild>
              <Link href="/login">Go to App</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl xl:text-6xl/none">
                    Unlock Your Potential with LearnetIQ
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The all-in-one learning platform designed for students, tutors, and parents. Personalized,
                    collaborative, and engaging education at your fingertips.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">Get Started for Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#">Learn More</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/landing-hero/800/600"
                width="800"
                height="600"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
                data-ai-hint="online learning student"
              />
            </div>
          </div>
        </section>
        <section className="w-full bg-secondary py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
             <FeaturesCarousel />
          </div>
        </section>
      </main>
    </div>
  );
}
