'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LeftFilterSidebar } from './components/LeftFilterSidebar';
import { ForumFeed } from './components/ForumFeed';
import { RightSidebarWidgets } from './components/RightSidebarWidgets';
import { CreateThreadModal } from './components/CreateThreadModal';
import { useForumRealtime } from '../../../hooks/useForumRealtime';
import { Post } from './types';

export default function StudentForum() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load saved posts from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('student_forum_saved');
      if (saved) {
        setSavedPostIds(JSON.parse(saved));
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when savedPostIds change
  React.useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('student_forum_saved', JSON.stringify(savedPostIds));
    }
  }, [savedPostIds, isLoaded]);

  // Initialize real-time hook
  const { posts, broadcastNewPost, broadcastVoteUpdate, broadcastNewComment } = useForumRealtime([]);

  const savedPosts = posts.filter(p => savedPostIds.includes(p.id));

  const handleToggleSave = (postId: string) => {
    setSavedPostIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  return (
    <div className="min-h-screen bg-obsidian text-zinc-200 pb-12">
      {/* Top Banner Area */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-4 px-6 mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Student Community</h1>
      </div>

      <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-[20%_55%_25%] gap-6">
        
        {/* --- LEFT SIDEBAR (Filters) --- */}
        <LeftFilterSidebar savedPosts={savedPosts} />

        {/* --- MAIN FEED --- */}
        <ForumFeed 
          posts={posts} 
          savedPostIds={savedPostIds}
          isAdmin={false}
          onVote={broadcastVoteUpdate} 
          onComment={broadcastNewComment}
          onOpenCreateModal={() => setIsCreateModalOpen(true)} 
          onToggleSave={handleToggleSave}
          onDelete={() => {}}
        />

        {/* --- RIGHT SIDEBAR (Widgets) --- */}
        <RightSidebarWidgets 
          onOpenCreateModal={() => setIsCreateModalOpen(true)} 
        />

      </div>

      {/* --- CREATE THREAD MODAL --- */}
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

