'use client';

import { createClient } from '@/utils/supabase/client';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CommentThread } from '@/components/app/student/community/comment-thread';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function PostPage() {
    const params = useParams();
    const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId;
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: postData } = await supabase
                .from('posts')
                .select(`
                    *,
                    author:profiles!posts_author_id_fkey (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('id', postId)
                .single();
            
            if (postData) setPost(postData);

            const { data: commentsData } = await supabase
                .from('forum_comments')
                .select(`
                    *,
                    author:profiles!forum_comments_author_id_fkey (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });
            
            if (commentsData) setComments(commentsData);
            setLoading(false);
        };

        if (postId) {
            fetchData();

            // Real-time subscription for comments
            const channel = supabase
                .channel(`post-comments-${postId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'forum_comments',
                    filter: `post_id=eq.${postId}`
                }, (payload) => {
                    // Fetch full comment with author
                    supabase
                        .from('forum_comments')
                        .select(`
                            *,
                            author:profiles!forum_comments_author_id_fkey (
                                full_name,
                                avatar_url
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single()
                        .then(({ data }) => {
                            if (data) setComments(current => [...current, data]);
                        });
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [postId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading post...</p>
            </div>
        );
    }

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
                            <AvatarFallback>{post.author?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{post.author?.full_name || 'Unknown'}</span>
                    </div>
                    <span>&middot;</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{post.content}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Leave a Comment</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-4">
                        <Textarea placeholder="Share your thoughts..." />
                        <Button className="self-end">
                            <Send className="mr-2 h-4 w-4" />
                            Post Comment
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Comments ({comments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <CommentThread comments={comments} />
                </CardContent>
            </Card>
        </div>
    );
}
