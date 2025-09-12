

'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { resourceLibrary } from '@/lib/data';
import { Download, FileText, PlayCircle, Sheet, Book, Calculator, Map, Landmark, Briefcase, Atom, Beaker, Dna, Languages, FlaskConical, Building2, Network, Dumbbell, TrendingUp, BookOpenText, Store, Cpu, Theater, ScrollText, Users, Tractor, DraftingCompass, Palette, MessageCircle, File, Video, FileSpreadsheet, Presentation, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Resource, ResourceSubject } from '@/lib/types';
import { SchoolHeader } from '@/components/app/school-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import * as React from 'react';

const resourceIcons: Record<Resource['type'], React.ElementType> = {
  pdf: File,
  video: Video,
  article: Book,
  worksheet: Sheet,
  word: FileText,
  excel: FileSpreadsheet,
  ppt: Presentation,
  mp3: FileAudio,
};

const subjectIcons: Record<string, React.ElementType> = {
    "Mathematics": Calculator,
    "Geography": Map,
    "History": Landmark,
    "Accounting": Briefcase,
    "Science": FlaskConical,
    "Biology": Dna,
    "Business studies": Building2,
    "Physics": Atom,
    "ICT": Network,
    "Physical Education": Dumbbell,
    "Chemistry": Beaker,
    "Economics": TrendingUp,
    "English Literature": BookOpenText,
    "Commerce": Store,
    "Computer Science": Cpu,
    "Performing arts": Theater,
    "Religious studies": ScrollText,
    "Sociology": Users,
    "Agriculture": Tractor,
    "Design and Technology": DraftingCompass,
    "Visual Arts": Palette,
    "Business English": MessageCircle,
    "Shona": Languages,
}

const filterOptions: {type: Resource['type'], label: string}[] = [
    { type: 'pdf', label: 'PDFs' },
    { type: 'video', label: 'Videos' },
    { type: 'word', label: 'Word' },
    { type: 'excel', label: 'Excel' },
    { type: 'ppt', label: 'PPT' },
    { type: 'mp3', label: 'MP3' },
];

function ResourceCard({ resource }: { resource: Resource }) {
    const Icon = resourceIcons[resource.type];
    return (
        <Card className="flex-shrink-0 w-[280px] overflow-hidden">
             <CardHeader className="p-0">
                <div className="relative aspect-[3/2] w-full">
                    <Image src={resource.image} alt={resource.title} fill className="object-cover" data-ai-hint={resource.imageHint} />
                     <Badge className="absolute top-2 right-2 capitalize">{resource.type}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h4 className="font-semibold">{resource.title}</h4>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{resource.size}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full" asChild>
                    <Link href={resource.url}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function SubjectAccordionItem({ subject, filter }: { subject: ResourceSubject, filter: Resource['type'] | 'all' }) {
    const Icon = subjectIcons[subject.title] || Book;

    const filteredTopics = subject.topics.map(topic => ({
        ...topic,
        resources: topic.resources.filter(resource => filter === 'all' || resource.type === filter)
    })).filter(topic => topic.resources.length > 0);

    if (filteredTopics.length === 0) {
        return null; // Don't render the subject if no topics match the filter
    }

    return (
        <AccordionItem value={subject.id} className="border rounded-lg bg-card">
            <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline">
              <div className="flex items-center gap-4">
                <Icon className="h-6 w-6 text-primary" />
                {subject.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                {filteredTopics.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-4">
                        {filteredTopics.map((topic) => (
                        <AccordionItem value={topic.id} key={topic.id} className="border-none bg-muted/50 rounded-lg">
                            <AccordionTrigger className="p-4 font-semibold text-base hover:no-underline">
                            {topic.title}
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                {topic.resources.length > 0 ? (
                                     <div className="flex gap-4 overflow-x-auto pb-2">
                                        {topic.resources.map((resource) => (
                                            <ResourceCard key={resource.id} resource={resource} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No resources available for this topic yet.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p className="text-muted-foreground pl-4">No topics available for this subject yet.</p>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = React.useState<Resource['type'] | 'all'>('all');

  const filteredSubjects = resourceLibrary.map(subject => ({
      ...subject,
      topics: subject.topics.map(topic => ({
          ...topic,
          resources: topic.resources.filter(resource => activeFilter === 'all' || resource.type === activeFilter)
      })).filter(topic => topic.resources.length > 0)
  })).filter(subject => subject.topics.length > 0);

  return (
    <div className="space-y-6">
        <SchoolHeader />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
        <p className="text-muted-foreground">
          Find worksheets, videos, and articles to support your learning.
        </p>
      </div>

       <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-2">
            <Button variant={activeFilter === 'all' ? 'default' : 'ghost'} onClick={() => setActiveFilter('all')}>All Formats</Button>
            {filterOptions.map(option => (
                <Button key={option.type} variant={activeFilter === option.type ? 'default' : 'ghost'} onClick={() => setActiveFilter(option.type)}>
                    {option.label}
                </Button>
            ))}
        </CardContent>
      </Card>

      <Accordion type="multiple" className="w-full space-y-4">
        {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
                <SubjectAccordionItem key={subject.id} subject={subject} filter={activeFilter} />
            ))
        ) : (
            <div className="text-center py-16 text-muted-foreground border rounded-lg">
              <p>No resources found for the selected filter.</p>
            </div>
        )}
      </Accordion>
    </div>
  );
}
