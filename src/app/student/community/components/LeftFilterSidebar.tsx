'use client';

import React, { useEffect, useState } from 'react';
import { Post, Community } from '../types';
import { Bookmark, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface LeftFilterSidebarProps {
  savedPosts: Post[];
}

export function LeftFilterSidebar({ savedPosts = [] }: LeftFilterSidebarProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribedIds, setSubscribedIds] = useState<string[]>([]);
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    // Load subscriptions from local storage
    const saved = localStorage.getItem('community_subscriptions');
    if (saved) {
      setSubscribedIds(JSON.parse(saved));
    }

    const fetchCommunities = async () => {
      const { data } = await supabase
        .from('forum_communities')
        .select('*')
        .limit(10);
      
      if (data) {
        setCommunities(data as Community[]);
      }
      setLoading(false);
    };
    fetchCommunities();
    
    // Listen for custom event when user joins a community
    const handleSubChange = () => {
      const updated = localStorage.getItem('community_subscriptions');
      if (updated) setSubscribedIds(JSON.parse(updated));
    };
    window.addEventListener('community_subscriptions_updated', handleSubChange);
    return () => window.removeEventListener('community_subscriptions_updated', handleSubChange);
  }, [supabase]);

  // For real-time informed suggestions, we can sort or slice based on actual fetched data
  const mostVisited = communities.slice(0, 2);
  const subscriptions = communities.filter(c => subscribedIds.includes(c.id));

  return (
    <aside className="hidden lg:block space-y-6 sticky top-4">
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-foreground/ uppercase tracking-wider px-3">Most Visited</h3>
        <ul className="space-y-1">
          {loading ? (
            <li className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Loading...</li>
          ) : mostVisited.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">No visits yet.</li>
          ) : (
            mostVisited.map((comm) => (
              <li key={`visit-${comm.id}`}>
                <Link href={`/student/community/${comm.id}`} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/ hover:bg-background hover:text-foreground/ rounded-md transition-colors">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  <span className="truncate">{comm.name}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-foreground/ uppercase tracking-wider px-3">Subscriptions</h3>
        <ul className="space-y-1">
          {loading ? (
            <li className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Loading...</li>
          ) : subscriptions.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">You are not subscribed to any communities yet.</li>
          ) : (
            subscriptions.map((community) => (
              <li key={`sub-${community.id}`}>
                <Link href={`/student/community/${community.id}`} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/ hover:bg-background hover:text-foreground/ rounded-md transition-colors">
                  <span className="text-xl leading-none flex-shrink-0">🎓</span>
                  <span className="truncate">{community.name}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-foreground/ uppercase tracking-wider px-3">Saved Forums</h3>
        <ul className="space-y-1">
          {savedPosts.length === 0 ? (
            <li className="px-3 py-2 text-xs text-foreground/">No saved posts yet.</li>
          ) : (
            savedPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/student/community/${post.community_id}/${post.id}`} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/ hover:bg-background hover:text-foreground/ rounded-md transition-colors text-left">
                  <Bookmark className="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" />
                  <span className="truncate">{post.title}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}
