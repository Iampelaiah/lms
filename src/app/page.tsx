import { FeaturesCarousel } from '@/components/app/landing/features-carousel';
import { StatisticsSection } from '@/components/app/landing/statistics-section';
import { TestimonialsSection } from '@/components/app/landing/testimonials-section';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function Footer() {
  return (
    <footer className="w-full bg-secondary">
      <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 px-4 py-12 md:px-6">
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col gap-4">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">LearnetIQ</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Empowering the next generation of learners.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Platform</h4>
          <nav className="flex flex-col gap-1">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground" prefetch={false}>
              Features
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground" prefetch={false}>
              Pricing
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground" prefetch={false}>
              Tutors
            </Link>
          </nav>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Company</h4>
          <nav className="flex flex-col gap-1">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground" prefetch={false}>
              About Us
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground" prefetch={false}>
              Careers
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground" prefetch={false}>
              Press
            </Link>
          </nav>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Resources</h4>
          <nav className="flex flex-col gap-1">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground" prefetch={false}>
              Blog
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground" prefetch={false}>
              Help Center
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground" prefetch={false}>
              Contact Us
            </Link>
          </nav>
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 space-y-2">
          <h4 className="font-semibold">Join LearnetIQ</h4>
          <p className="text-sm text-muted-foreground">Start your learning journey today.</p>
          <Button asChild>
            <Link href="/login">Go to App</Link>
          </Button>
        </div>
      </div>
      <div className="container flex flex-col items-center justify-between gap-4 border-t px-4 py-6 sm:flex-row md:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-foreground text-background">N</AvatarFallback>
          </Avatar>
          <span>© 2025 LearnetIQ. All rights reserved.</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
            Privacy Policy
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}

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
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              prefetch={false}
            >
              Features
            </Link>
            <Link
              href="#statistics"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              prefetch={false}
            >
              Statistics
            </Link>
            <Link
              href="#testimonials"
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
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl xl:text-6xl/none">
                    Unlock Your Potential with LearnetIQ
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                    The all-in-one learning platform designed for students, tutors, and parents. Personalized,
                    collaborative, and engaging education at your fingertips.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
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
        <section id="features" className="w-full bg-secondary py-12 md:py-24 lg:py-32 scroll-mt-14">
          <FeaturesCarousel />
        </section>
        <section id="statistics" className="w-full py-12 md:py-24 lg:py-32 scroll-mt-14">
          <div className="container px-4 md:px-6">
            <StatisticsSection />
          </div>
        </section>
        <section id="testimonials" className="w-full bg-secondary py-12 md:py-24 lg:py-32 scroll-mt-14">
          <div className="container px-4 md:px-6">
            <TestimonialsSection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
