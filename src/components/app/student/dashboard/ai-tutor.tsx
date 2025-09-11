'use client';

import { aiTutorResourcePrompting } from '@/ai/flows/ai-tutor-resource-prompting';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Loader2, Send, Sparkles } from 'lucide-react';
import React, { useState, useTransition } from 'react';

type AiTutorResourcePromptingOutput = {
  resources: string[];
};

async function askTutorAction(
  query: string
): Promise<AiTutorResourcePromptingOutput> {
  'use server';
  try {
    const response = await aiTutorResourcePrompting({
      query: query,
      studentHistory: 'Completed Algebra I, currently studying Geometry.',
    });
    return response;
  } catch (e) {
    console.error(e);
    // In a real app, you'd handle this error more gracefully
    return { resources: ['Error: Could not get resources. Please try again.'] };
  }
}

export function AiTutor() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string[] | null>(null);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('query') as string;

    if (!query.trim()) {
      toast({
        title: 'Empty Query',
        description: 'Please enter a topic you need help with.',
        variant: 'destructive'
      })
      return;
    }

    startTransition(async () => {
      const response = await askTutorAction(query);
      setResult(response.resources);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="text-primary" />
          <span>AI Tutor Assistant</span>
        </CardTitle>
        <CardDescription>
          Stuck on a topic? Ask for resources and get instant help.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            name="query"
            placeholder="e.g., 'Explain the Pythagorean theorem' or 'Find videos on cellular respiration'"
            className="min-h-[80px]"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Get Resources
          </Button>
        </form>

        {(isPending || result) && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Suggested Resources
            </h4>
            {isPending ? (
                <div className="space-y-2">
                    <div className="w-full h-4 bg-muted rounded animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-muted rounded animate-pulse"></div>
                    <div className="w-5/6 h-4 bg-muted rounded animate-pulse"></div>
                </div>
            ) : (
                result && (
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground bg-secondary/50 p-4 rounded-md">
                    {result.map((res, index) => (
                    <li key={index}>{res}</li>
                    ))}
                </ul>
                )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
