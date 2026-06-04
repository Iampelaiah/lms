import React, { useState } from 'react';
import { Post } from '../types';
import { PostCard } from './PostCard';
import { Flame, Sparkles, Trophy, ArrowBigUp, LayoutGrid, List, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface ForumFeedProps {
  posts: Post[];
  savedPostIds: string[];
  isAdmin: boolean;
  onVote: (postId: string, newVotes: number) => void;
  onComment: (postId: string, comment: {id: string, text: string, author: string}) => void;
  onOpenCreateModal: () => void;
  onToggleSave: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export function ForumFeed({ posts, savedPostIds, isAdmin, onVote, onComment, onOpenCreateModal, onToggleSave, onDelete }: ForumFeedProps) {
  const [activeSort, setActiveSort] = useState('New');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');

  // Real-time sort logic
  const sortedPosts = [...posts].sort((a, b) => {
    const aComments = a.comments ? a.comments.length : 0;
    const bComments = b.comments ? b.comments.length : 0;
    
    if (activeSort === 'New') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (activeSort === 'Top' || activeSort === 'Best') {
      return b.votes - a.votes;
    }
    if (activeSort === 'Hot') {
      // Hot = votes + (comments * 2) + recency (simplified to just engagement)
      const aScore = a.votes + (aComments * 2);
      const bScore = b.votes + (bComments * 2);
      return bScore - aScore;
    }
    return 0;
  });

  return (
    <main className="space-y-4">
      {/* Sort & Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center justify-between sticky top-4 z-10 shadow-lg">
        <div className="flex items-center gap-1">
          {['Best', 'Hot', 'New', 'Top'].map((sort) => {
            const isActive = activeSort === sort;
            return (
              <button
                key={sort}
                onClick={() => setActiveSort(sort)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-zinc-800 text-orange-500' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                {sort === 'Hot' && <Flame className="w-4 h-4" />}
                {sort === 'New' && <Sparkles className="w-4 h-4" />}
                {sort === 'Top' && <Trophy className="w-4 h-4" />}
                {sort === 'Best' && <ArrowBigUp className="w-4 h-4" />}
                <span className="hidden sm:inline">{sort}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
          <button 
            onClick={() => setViewMode('card')}
            className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-zinc-800 text-zinc-200' : 'hover:bg-zinc-800'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('compact')}
            className={`p-1.5 rounded ${viewMode === 'compact' ? 'bg-zinc-800 text-zinc-200' : 'hover:bg-zinc-800'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Create Post Button */}
      <div className="md:hidden block">
        <button 
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-full transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Create Thread
        </button>
      </div>

      {/* Feed Content */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedPosts
            .filter((post, index, self) => self.findIndex(p => p.id === post.id) === index)
            .map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              isSaved={savedPostIds.includes(post.id)}
              isAdmin={isAdmin}
              onVote={onVote} 
              onComment={onComment}
              onToggleSave={() => onToggleSave(post.id)}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
