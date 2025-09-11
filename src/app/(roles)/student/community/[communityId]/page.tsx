import { communities } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, PlusCircle } from 'lucide-react';

export default function CommunityPostsPage({
  params,
}: {
  params: { communityId: string };
}) {
  const community = communities.find((c) => c.id === params.communityId);

  if (!community) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{community.name}</h1>
          <p className="text-muted-foreground">{community.description}</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>

      <div className="space-y-4">
        {community.posts.map((post) => (
          <Link href={`/student/community/${community.id}/${post.id}`} key={post.id} className="block">
            <Card className="hover:bg-secondary/50 transition-colors">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.author.avatarUrl} alt={post.author.name} data-ai-hint={post.author.avatarHint} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{post.author.name}</span>
                  </div>
                  <span>&middot;</span>
                  <span>{post.createdAt}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{post.commentCount} comments</span>
              </CardContent>
            </Card>
          </Link>
        ))}
         {community.posts.length === 0 && (
             <div className="text-center py-16 text-muted-foreground">
                <p>No posts yet. Be the first to start a discussion!</p>
            </div>
         )}
      </div>
    </div>
  );
}
