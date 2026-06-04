'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LeftFilterSidebar } from '../../student/community/components/LeftFilterSidebar';
import { ForumFeed } from '../../student/community/components/ForumFeed';
import { RightSidebarWidgets } from '../../student/community/components/RightSidebarWidgets';
import { CreateThreadModal } from '../../student/community/components/CreateThreadModal';
import { useForumRealtime } from '../../../hooks/useForumRealtime';
import { Post } from '../../student/community/types';

export default function AdminForum() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('student_forum_saved');
      if (saved) {
        setSavedPostIds(JSON.parse(saved));
      }
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('student_forum_saved', JSON.stringify(savedPostIds));
    }
  }, [savedPostIds, isLoaded]);

  const { posts, broadcastNewPost, broadcastVoteUpdate, broadcastNewComment, broadcastDeletePost } = useForumRealtime([]);

  const savedPosts = posts.filter(p => savedPostIds.includes(p.id));

  const handleToggleSave = (postId: string) => {
    setSavedPostIds(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground/ pb-12">
      <div className="bg-background border-b border-border py-4 px-6 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground/">Community Forums</h1>
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border border-burgundy/30 bg-burgundy/10 text-burgundy/80">
          Admin — Full Control
        </span>
      </div>

      <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-[20%_55%_25%] gap-6">
        <LeftFilterSidebar savedPosts={savedPosts} />

        <ForumFeed
          posts={posts}
          savedPostIds={savedPostIds}
          isAdmin={true}
          onVote={broadcastVoteUpdate}
          onComment={broadcastNewComment}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onToggleSave={handleToggleSave}
          onDelete={broadcastDeletePost}
        />

        <RightSidebarWidgets
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateThreadModal
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={broadcastNewPost}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


