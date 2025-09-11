import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { BrainCircuit, BookOpen, Users } from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Enhancements',
    description:
      'Leverage the power of AI for personalized learning paths, resource recommendations, and automated feedback.',
    image: {
      src: 'https://picsum.photos/seed/feature-ai/1200/800',
      hint: 'artificial intelligence',
    },
  },
  {
    icon: BookOpen,
    title: 'Interactive Courses',
    description:
      'Engage with our rich course content, including videos, quizzes, and hands-on projects designed by expert tutors.',
    image: {
      src: 'https://picsum.photos/seed/feature-courses/1200/800',
      hint: 'online course',
    },
  },
  {
    icon: Users,
    title: 'Community Hub',
    description:
      'Connect with peers, join study groups, and learn together in our vibrant community forums.',
    image: {
      src: 'https://picsum.photos/seed/feature-community/1200/800',
      hint: 'students collaborating',
    },
  },
];

export function FeaturesCarousel() {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {features.map((feature, index) => (
          <CarouselItem key={index}>
            <Card className="overflow-hidden">
              <CardContent className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                <div className="relative aspect-[3/2] rounded-lg overflow-hidden">
                    <Image
                        src={feature.image.src}
                        alt={feature.title}
                        fill
                        className="object-cover"
                        data-ai-hint={feature.image.hint}
                    />
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <feature.icon className="w-12 h-12 text-primary" />
                  <h3 className="text-3xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 hidden lg:flex" />
      <CarouselNext className="absolute right-[-1.5rem] top-1/2 -translate-y-1/2 hidden lg:flex" />
    </Carousel>
  );
}
