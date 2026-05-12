'use client';

import { createClient } from '@/utils/supabase/client';
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
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { SchoolHeader } from '@/components/app/school-header';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/providers/user-context';
import { CreatePostDialog } from '@/components/app/community/create-post-dialog';

function AboutCommunity({ community }: { community: any }) {
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
            Active Forum
          </span>
        </div>
        <Button className="w-full">Join Community</Button>
      </CardContent>
    </Card>
  );
}

export default function CommunityPostsPage() {
  const params = useParams();
  const communityId = Array.isArray(params.communityId) ? params.communityId[0] : params.communityId;
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUser();
  const supabase = createClient();

  useEffect(() => {
    const fetchCommunityData = async () => {
      // Fetch Community
      const { data: commData } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();
      
      if (commData) {
        setCommunity(commData);
        // Fetch Posts
        const { data: postData } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!posts_author_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });
        
        if (postData) setPosts(postData);
      }
      setLoading(false);
    };

    if (communityId) {
        fetchCommunityData();

        // Real-time subscription
        const channel = supabase
            .channel(`community-${communityId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'posts',
                filter: `community_id=eq.${communityId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    // Fetch the full post with author info to append
                    supabase
                        .from('posts')
                        .select(`
                            *,
                            author:profiles!posts_author_id_fkey (
                                full_name,
                                avatar_url
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single()
                        .then(({ data }) => {
                            if (data) setPosts(current => [data, ...current]);
                        });
                } else if (payload.eventType === 'DELETE') {
                    setPosts(current => current.filter(p => p.id !== payload.old.id));
                } else if (payload.eventType === 'UPDATE') {
                    setPosts(current => current.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, [communityId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading discussion...</p>
      </div>
    );
  }

  if (!community) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Community Not Found
            </h3>
            <p className="text-sm text-muted-foreground">
              This community does not exist or has been moved.
            </p>
            <Button asChild className="mt-4">
                <Link href="/student/community">Back to Communities</Link>
            </Button>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <SchoolHeader />
      <div className="relative">
        <div className="h-48 md:h-72 w-full overflow-hidden rounded-lg">
          <Image
            src={community.image_url || "https://picsum.photos/seed/community-banner/1200/300"}
            alt={`${community.name} banner`}
            width={1200}
            height={300}
            className="object-cover w-full h-full"
            data-ai-hint="community abstract background"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
          <div className="container mx-auto px-6 flex items-end gap-4">
            <div className="-mb-8 h-20 w-20 rounded-full bg-secondary border-4 border-background flex items-center justify-center overflow-hidden">
               <Avatar className="w-full h-full">
                  <AvatarFallback className="text-2xl font-bold">{community.name[0]}</AvatarFallback>
               </Avatar>
            </div>
            <div className="flex-grow">
              <h1 className="text-2xl md:text-3xl font-bold">
                {community.name}
              </h1>
              <p className="text-muted-foreground">{community.description}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {profile?.id && (
                <CreatePostDialog communityId={communityId} authorId={profile.id} />
              )}
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
           {profile?.id && (
                <CreatePostDialog 
                    communityId={communityId} 
                    authorId={profile.id} 
                    trigger={<Button className="w-full sm:hidden mb-4"><PlusCircle className="mr-2 h-4 w-4" /> Create Post</Button>}
                />
            )}
          {posts.map((post) => (
            <Card key={post.id} className="flex gap-2 p-2">
              <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                <Button variant="ghost" size="icon">
                  <ArrowBigUp />
                </Button>
                <span className="font-bold text-sm">0</span>
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
                            src={post.author?.avatar_url}
                            alt={post.author?.full_name}
                          />
                          <AvatarFallback>
                            {post.author?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground">Posted by {post.author?.full_name || 'Unknown'}</span>
                      </div>
                      <span>&middot;</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </CardDescription>
                     <CardTitle className="text-lg pt-1">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm line-clamp-3">{post.content}</p>
                    {post.image_url && (
                        <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-muted">
                            <Image 
                                src={post.image_url} 
                                alt={post.title} 
                                fill 
                                className="object-contain" 
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>0 comments</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </Card>
          ))}
          {posts.length === 0 && (
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
