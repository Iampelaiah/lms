import type { Comment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} data-ai-hint={comment.author.avatarHint} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <p className="font-semibold">{comment.author.name}</p>
          <p className="text-xs text-muted-foreground">{comment.createdAt}</p>
        </div>
        <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentThread({ comments }: { comments: Comment[] }) {
  if (!comments || comments.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No comments yet. Start the conversation!</p>;
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
