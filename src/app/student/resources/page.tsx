'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Download, FileText, Sheet, Book, Calculator, Map, Landmark, Briefcase, Atom, Beaker, Dna, Languages, FlaskConical, Building2, Network, Dumbbell, TrendingUp, BookOpenText, Store, Cpu, Theater, ScrollText, Users, Tractor, DraftingCompass, Palette, MessageCircle, File, Video, FileSpreadsheet, Presentation, FileAudio, Scale, Lightbulb, BookCopy, Loader2, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SchoolHeader } from '@/components/app/school-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import * as React from 'react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const resourceIcons: Record<string, React.ElementType> = {
  pdf: File,
  video: Video,
  article: Book,
  worksheet: Sheet,
  word: FileText,
  excel: FileSpreadsheet,
  ppt: Presentation,
  mp3: FileAudio,
};

const filterOptions = [
    { type: 'pdf', label: 'PDFs' },
    { type: 'video', label: 'Videos' },
    { type: 'word', label: 'Word' },
    { type: 'excel', label: 'Excel' },
    { type: 'ppt', label: 'PPT' },
    { type: 'mp3', label: 'MP3' },
];

function ResourceCard({ resource }: { resource: any }) {
    const Icon = resourceIcons[resource.type] || File;
    return (
        <Card className="flex-shrink-0 w-[280px] overflow-hidden">
             <CardHeader className="p-0">
                <div className="relative aspect-[3/2] w-full bg-muted flex items-center justify-center">
                    <Icon className="h-12 w-12 text-muted-foreground/20" />
                     <Badge className="absolute top-2 right-2 capitalize">{resource.type}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h4 className="font-semibold truncate">{resource.title}</h4>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{resource.size || 'N/A'}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full" asChild>
                    <Link href={resource.url} target="_blank">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = React.useState<string | 'all'>('all');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          subject:courses (
            title
          )
        `);
      
      if (data) setResources(data);
      setLoading(false);
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter(r => 
    activeFilter === 'all' || r.type === activeFilter
  );

  // Group by Subject
  const groupedResources = filteredResources.reduce((acc: any, resource) => {
    const subjectTitle = resource.subject?.title || 'General Resources';
    if (!acc[subjectTitle]) acc[subjectTitle] = [];
    acc[subjectTitle].push(resource);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading resources...</p>
      </div>
    );
  }

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

      {resources.length === 0 ? (
        <Card className="p-16 text-center">
          <Library className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium">Your library is currently empty</h3>
          <p className="text-muted-foreground">Tutors haven't uploaded any resources yet.</p>
        </Card>
      ) : (
        <Accordion type="multiple" className="w-full space-y-4">
          {Object.entries(groupedResources).map(([subject, items]: [string, any]) => (
            <AccordionItem key={subject} value={subject} className="border rounded-lg bg-card">
              <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline">
                <div className="flex items-center gap-4">
                  <Book className="h-6 w-6 text-primary" />
                  {subject}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {items.map((resource: any) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
