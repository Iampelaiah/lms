import React from 'react';
import { mockCommunities, Post } from '../types';
import { Bookmark } from 'lucide-react';

interface LeftFilterSidebarProps {
  savedPosts: Post[];
}

export function LeftFilterSidebar({ savedPosts = [] }: LeftFilterSidebarProps) {
  return (
    <aside className="hidden lg:block space-y-6 sticky top-4">
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-3">Most Visited</h3>
        <ul className="space-y-1">
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 rounded-md transition-colors">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              General Discussion
            </button>
          </li>
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 rounded-md transition-colors">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              A-Level Mathematics
            </button>
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-3">Subscriptions</h3>
        <ul className="space-y-1">
          {mockCommunities.map((community) => (
            <li key={community.id}>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 rounded-md transition-colors">
                <span className="text-xl leading-none">🎓</span>
                <span className="truncate">{community.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-3">Saved Forums</h3>
        <ul className="space-y-1">
          {savedPosts.length === 0 ? (
            <li className="px-3 py-2 text-xs text-zinc-500">No saved posts yet.</li>
          ) : (
            savedPosts.map((post) => (
              <li key={post.id}>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 rounded-md transition-colors text-left">
                  <Bookmark className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" />
                  <span className="truncate">{post.title}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}
