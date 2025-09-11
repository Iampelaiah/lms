import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { communities } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Forums</h1>
        <p className="text-muted-foreground">
          Connect with peers, ask questions, and share your knowledge.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {communities.map((community) => (
          <Card key={community.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{community.name}</CardTitle>
              <CardDescription>{community.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center mt-auto pt-4">
               <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2"/>
                {community.members} members
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
    </div>
  );
}
