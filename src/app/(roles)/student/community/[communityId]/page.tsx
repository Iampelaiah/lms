'use client';

import { communities } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  PlusCircle,
  MoreHorizontal,
  ArrowBigUp,
  ArrowBigDown,
  Book,
} from 'lucide-react';
import Image from 'next/image';
import { SchoolHeader } from '@/components/app/school-header';

function AboutCommunity({ community }: { community: (typeof communities)[0] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Community</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{community.description}</p>
        <div className="flex items-center gap-2">
          <Book className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {community.members} members
          </span>
        </div>
        <Button className="w-full">Join Community</Button>
      </CardContent>
    </Card>
  );
}

export default function CommunityPostsPage({
  params,
}: {
  params: { communityId: string };
}) {
  const community = communities.find((c) => c.id === params.communityId);

  if (!community) {
    notFound();
  }

  const iconMap: Record<string, React.ElementType> = {
    'math-club': () => <span className="text-2xl font-bold">∑</span>,
    'history-buffs': () => (
      <span className="text-2xl font-bold">🏛️</span>
    ),
    'science-explorers': () => (
      <span className="text-2xl font-bold">🔬</span>
    ),
    'book-worms': () => <span className="text-2xl font-bold">📚</span>,
  };
  const Icon = iconMap[community.id] || (() => <span />);

  return (
    <div className="space-y-6">
      <SchoolHeader />
      <div className="relative">
        <div className="h-48 md:h-72 w-full overflow-hidden rounded-lg">
          <Image
            src="https://picsum.photos/seed/community-banner/1200/300"
            alt={`${community.name} banner`}
            width={1200}
            height={300}
            className="object-cover w-full h-full"
            data-ai-hint="community abstract background"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
          <div className="container mx-auto px-6 flex items-end gap-4">
            <div className="-mb-8 h-20 w-20 rounded-full bg-secondary border-4 border-background flex items-center justify-center">
              <Icon />
            </div>
            <div className="flex-grow">
              <h1 className="text-2xl md:text-3xl font-bold">
                {community.name}
              </h1>
              <p className="text-muted-foreground">{community.description}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Post
              </Button>
              <Button variant="outline">Join</Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
           <Button className="w-full sm:hidden">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Post
            </Button>
          {community.posts.map((post) => (
            <Card key={post.id} className="flex gap-2 p-2">
              <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                <Button variant="ghost" size="icon">
                  <ArrowBigUp />
                </Button>
                <span className="font-bold text-sm">256</span>
                <Button variant="ghost" size="icon">
                  <ArrowBigDown />
                </Button>
              </div>
              <Link
                href={`/student/community/${community.id}/${post.id}`}
                className="block flex-grow"
              >
                <Card className="hover:bg-secondary/50 transition-colors border-0 shadow-none">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={post.author.avatarUrl}
                            alt={post.author.name}
                            data-ai-hint={post.author.avatarHint}
                          />
                          <AvatarFallback>
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground">Posted by {post.author.name}</span>
                      </div>
                      <span>&middot;</span>
                      <span>{post.createdAt}</span>
                    </CardDescription>
                     <CardTitle className="text-lg pt-1">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.commentCount} comments</span>
                  </CardContent>
                </Card>
              </Link>
            </Card>
          ))}
          {community.posts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground border rounded-lg">
              <p>No posts yet. Be the first to start a discussion!</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-1 space-y-6 sticky top-20">
          <AboutCommunity community={community} />
        </div>
      </div>
    </div>
  );
}
