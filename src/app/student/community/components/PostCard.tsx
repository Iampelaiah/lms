import React, { useState } from 'react';
import { Post } from '../types';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Bookmark, Flag, Send, Trash2, FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
  isSaved: boolean;
  isAdmin: boolean;
  onVote: (postId: string, newVotes: number) => void;
  onComment: (postId: string, comment: {id: string, text: string, author: string}) => void;
  onToggleSave: () => void;
  onDelete?: (postId: string) => void;
}

export const PostCard = ({ post, isSaved, isAdmin, onVote, onComment, onToggleSave, onDelete }: PostCardProps) => {
  const [localVoteState, setLocalVoteState] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const comments = post.comments || [];
  const [newCommentText, setNewCommentText] = useState('');

  const handleVote = (value: number) => {
    let newVoteState = 0;
    let voteDiff = 0;

    if (localVoteState === value) {
      newVoteState = 0;
      voteDiff = -value;
    } else {
      newVoteState = value;
      voteDiff = value - localVoteState;
    }

    setLocalVoteState(newVoteState);
    onVote(post.id, post.votes + voteDiff);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    onComment(post.id, { 
      id: crypto.randomUUID(), 
      text: newCommentText, 
      author: 'You' 
    });
    setNewCommentText('');
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col bg-background border border-border rounded-lg overflow-hidden hover:border-border transition-colors"
    >
      {post.is_research && (
        <div className="bg-gold/20 text-gold text-xs font-bold px-4 py-1 flex items-center gap-2 border-b border-gold/30">
          <FileText className="w-3 h-3" />
          Research Hub Discussion
        </div>
      )}
      <div className="flex">
        {/* Vote Sidebar */}
        <div className="w-12 bg-background/50 flex flex-col items-center py-2 gap-1 border-r border-border">
          <button 
            onClick={() => handleVote(1)} 
            className={`p-1 rounded hover:bg-background transition-colors ${localVoteState === 1 ? 'text-gold' : 'text-foreground/'}`}
          >
            <ArrowBigUp className="w-6 h-6" fill={localVoteState === 1 ? 'currentColor' : 'none'} />
          </button>
          <span className={`text-sm font-bold ${localVoteState === 1 ? 'text-gold' : localVoteState === -1 ? 'text-gold' : 'text-foreground/'}`}>
            {post.votes}
          </span>
          <button 
            onClick={() => handleVote(-1)} 
            className={`p-1 rounded hover:bg-background transition-colors ${localVoteState === -1 ? 'text-gold' : 'text-foreground/'}`}
          >
            <ArrowBigDown className="w-6 h-6" fill={localVoteState === -1 ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 text-xs text-foreground/">
              <span className="font-bold text-foreground/ hover:underline cursor-pointer">{post.community_name}</span>
              <span>•</span>
              <span>Posted by u/{post.author_name || 'Anonymous'}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>

            {/* Title & Tag */}
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border ${post.is_research ? 'bg-gold/20 text-gold border-gold/40' : 'bg-gold/10 text-gold border-gold/20'}`}>
                {post.tag}
              </span>
              <h2 className={`text-lg font-semibold ${post.is_research ? 'text-gold' : 'text-foreground/'}`}>{post.title}</h2>
            </div>

            {/* Snippet */}
            <p className="text-sm text-foreground/ line-clamp-3">
              {post.content}
            </p>

            {/* Resource Link */}
            {post.resource_url && (
              <a 
                href={post.resource_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gold bg-gold/10 px-3 py-1.5 rounded-md hover:bg-gold/20 transition-colors border border-gold/20 w-max mt-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Attached Resource
              </a>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1 pt-2 flex-wrap">
              <button 
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors ${showComments ? 'bg-background text-foreground/' : 'text-foreground/ hover:bg-background'}`}
              >
                <MessageSquare className="w-4 h-4" />
                {comments.length} Comments
              </button>
              
              {/* Share button removed as requested */}

              <button 
                onClick={onToggleSave}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors ${isSaved ? 'text-gold' : 'text-foreground/ hover:bg-background'}`}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-foreground/ hover:bg-background transition-colors sm:ml-auto">
                <Flag className="w-4 h-4" />
                Report
              </button>
              {isAdmin && onDelete && (
                <button 
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
                      onDelete(post.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-burgundy/80 hover:bg-burgundy/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Optional Thumbnail */}
          {post.image_url && (
            <div className="hidden sm:block w-32 h-32 flex-shrink-0 rounded-md overflow-hidden border border-border">
              <Image src={post.image_url} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" alt="Thumbnail" />
            </div>
          )}
        </div>
      </div>

      {/* Inline Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border bg-background/30 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                  Y
                </div>
                <div className="flex-1 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground/ focus:outline-none focus:border-gold"
                  />
                  <button 
                    type="submit" 
                    disabled={!newCommentText.trim()}
                    className="bg-gold hover:bg-gold disabled:opacity-50 disabled:hover:bg-gold text-foreground px-3 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pl-10">
                {comments.map(comment => (
                  <div key={comment.id} className="text-sm">
                    <span className="font-bold text-foreground/ mr-2">{comment.author}</span>
                    <span className="text-foreground/">{comment.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};



