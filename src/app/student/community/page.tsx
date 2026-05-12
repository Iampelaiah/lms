'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function CommunityPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCommunities = async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('name');
      
      if (data) setCommunities(data);
      setLoading(false);
    };

    fetchCommunities();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading communities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Forums</h1>
        <p className="text-muted-foreground">
          Connect with peers, ask questions, and share your knowledge.
        </p>
      </div>
      
      {communities.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium">No communities found</h3>
          <p className="text-muted-foreground">Check back later for new discussion groups.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {communities.map((community) => (
            <Card key={community.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>{community.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2"/>
                  Active Forum
                </div>
                <Button asChild>
                  <Link href={`/student/community/${community.id}`}>
                    Join Discussion
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
