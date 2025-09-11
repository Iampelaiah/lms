import { communities } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CommentThread } from '@/components/app/student/community/comment-thread';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import Image from 'next/image';

export default function PostPage({ params }: { params: { communityId: string, postId: string }}) {
    const community = communities.find((c) => c.id === params.communityId);
    const post = community?.posts.find((p) => p.id === params.postId);

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
                        <AvatarImage src={post.author.avatarUrl} alt={post.author.name} data-ai-hint={post.author.avatarHint} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{post.author.name}</span>
                    </div>
                    <span>&middot;</span>
                    <span>{post.createdAt}</span>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="prose dark:prose-invert max-w-none">
                        <p>{post.content}</p>
                        <div className="relative h-64 md:h-96 my-6 rounded-lg overflow-hidden">
                          <Image src="https://picsum.photos/seed/301/800/400" alt="Forum post image" fill className="object-cover" data-ai-hint="discussion collaboration"/>
                        </div>
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
                    <CardTitle>Comments ({post.commentCount})</CardTitle>
                </CardHeader>
                <CardContent>
                    <CommentThread comments={post.comments} />
                </CardContent>
            </Card>
        </div>
    );
}
