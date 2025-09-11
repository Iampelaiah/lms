'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import React from "react";
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'


type Topic = {
    name: string;
    progress: number;
}

type SubjectProgressCardProps = {
  subject: {
    name: string;
    overallProgress: number;
    icon: string; // We'll just use BookOpen for now as per the image
    topics: Topic[];
  };
};

function TopicCarousel({ topics }: { topics: Topic[] }) {
    const [emblaRef] = useEmblaCarousel({ direction: 'y', loop: true, align: 'start' }, [Autoplay({ delay: 2000, stopOnInteraction: false })])

    const topicsToDisplay = [...topics, ...topics, ...topics];

    return (
        <div className="overflow-hidden h-48" ref={emblaRef}>
             <div className="flex flex-col h-full">
                {topicsToDisplay.map((topic, index) => (
                    <div key={`${topic.name}-${index}`} className="bg-secondary/50 rounded-md p-3 flex-[0_0_auto] min-h-0 mb-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">{topic.name}</span>
                            <span className="font-semibold">{topic.progress}%</span>
                        </div>
                        <Progress value={topic.progress} className="h-1.5 mt-1" />
                    </div>
                ))}
            </div>
        </div>
    )
}


export function SubjectProgressCard({ subject }: SubjectProgressCardProps) {
    // Extend the topics to have at least 4 for the carousel
    const extendedTopics = [...subject.topics];
    while (extendedTopics.length < 4) {
        extendedTopics.push({ name: 'More topics coming soon', progress: 0 });
    }


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{subject.name}</CardTitle>
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{subject.overallProgress}%</span>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
        </div>
        <p className="text-sm text-muted-foreground">Overall Progress</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={subject.overallProgress} className="h-2" />
        <TopicCarousel topics={extendedTopics} />
      </CardContent>
    </Card>
  );
}