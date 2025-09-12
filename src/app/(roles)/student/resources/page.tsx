import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { resourceLibrary } from '@/lib/data';
import { Download, FileText, PlayCircle, Sheet, Book, Calculator, Map, Landmark, Briefcase, Atom, Beaker, Dna, Languages, FlaskConical, Building2, Network, Dumbbell, TrendingUp, BookOpenText, Store, Cpu, Theater, ScrollText, Users, Tractor, DraftingCompass, Palette, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Resource, ResourceSubject } from '@/lib/types';
import { SchoolHeader } from '@/components/app/school-header';

const resourceIcons: Record<Resource['type'], React.ElementType> = {
  pdf: FileText,
  video: PlayCircle,
  article: Book,
  worksheet: Sheet,
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

function SubjectAccordionItem({ subject }: { subject: ResourceSubject }) {
    const Icon = subjectIcons[subject.title] || Book;

    return (
        <AccordionItem value={subject.id} className="border rounded-lg bg-card">
            <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline">
              <div className="flex items-center gap-4">
                <Icon className="h-6 w-6 text-primary" />
                {subject.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                {subject.topics.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-2">
                        {subject.topics.map((topic) => (
                        <AccordionItem value={topic.id} key={topic.id} className="border-none">
                            <AccordionTrigger className="py-3 font-semibold text-base hover:no-underline">
                            {topic.title}
                            </AccordionTrigger>
                            <AccordionContent className="pb-0 pl-4">
                            <ul className="space-y-3">
                                {topic.resources.map((resource) => {
                                const ResourceIcon = resourceIcons[resource.type];
                                return (
                                    <li key={resource.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ResourceIcon className="h-5 w-5 text-muted-foreground" />
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
                ) : (
                    <p className="text-muted-foreground pl-4">No topics available for this subject yet.</p>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
        <SchoolHeader />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
        <p className="text-muted-foreground">
          Find worksheets, videos, and articles to support your learning.
        </p>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {resourceLibrary.map((subject) => (
            <SubjectAccordionItem key={subject.id} subject={subject} />
        ))}
      </Accordion>
    </div>
  );
}
