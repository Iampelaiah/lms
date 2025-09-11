import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { resourceLibrary } from '@/lib/data';
import { Download, FileText, PlayCircle, Sheet, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Resource } from '@/lib/types';

const resourceIcons: Record<Resource['type'], React.ElementType> = {
  pdf: FileText,
  video: PlayCircle,
  article: Book,
  worksheet: Sheet,
};

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
        <p className="text-muted-foreground">
          Find worksheets, videos, and articles to support your learning.
        </p>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {resourceLibrary.map((subject) => (
          <AccordionItem value={subject.id} key={subject.id} className="border rounded-lg bg-card">
            <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline">
              {subject.title}
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
              <Accordion type="multiple" className="w-full space-y-2">
                {subject.topics.map((topic) => (
                  <AccordionItem value={topic.id} key={topic.id} className="border-none">
                    <AccordionTrigger className="py-3 font-semibold text-base hover:no-underline">
                      {topic.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pl-4">
                      <ul className="space-y-3">
                        {topic.resources.map((resource) => {
                          const Icon = resourceIcons[resource.type];
                          return (
                            <li key={resource.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm">{resource.title}</span>
                              </div>
                              <Button asChild variant="ghost" size="icon">
                                <Link href={resource.url}>
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Download</span>
                                </Link>
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
