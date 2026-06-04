import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { mockCommunities } from '../types';

interface RightSidebarWidgetsProps {
  onOpenCreateModal: () => void;
}

export function RightSidebarWidgets({ onOpenCreateModal }: RightSidebarWidgetsProps) {
  const [isFetchingTrending, setIsFetchingTrending] = useState(false);

  const handleViewAllTrending = async () => {
    setIsFetchingTrending(true);
    console.log("Mocking fetch to Database/Supabase for top trending subjects...");
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log("Successfully fetched trending subjects sorted by engagement, comments, and upvotes!");
    setIsFetchingTrending(false);
  };

  return (
    <aside className="hidden md:block space-y-6">
      
      {/* Create Post Button */}
      <button 
        onClick={onOpenCreateModal}
        className="w-full flex items-center justify-center gap-2 bg-royal hover:bg-royal text-white font-bold py-3 px-4 rounded-full transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
      >
        <Plus className="w-5 h-5" />
        Create Thread
      </button>

      {/* Trending Communities Widget */}
      <div className="bg-obsidian border border-white/10 rounded-lg overflow-hidden">
        <div className="bg-obsidian/50 px-4 py-3 border-b border-white/10">
          <h3 className="font-bold text-white/90">Trending Subjects</h3>
        </div>
        <ul className="divide-y divide-zinc-800">
          {mockCommunities.slice(0, 3).map((comm, idx) => (
            <li key={comm.id} className="p-4 hover:bg-obsidian/30 transition-colors cursor-pointer flex items-center gap-3">
              <span className="text-xl font-bold text-white/60">{idx + 1}</span>
              <div>
                <h4 className="text-sm font-semibold text-white/90">{comm.name}</h4>
                <p className="text-xs text-white/60">{comm.members_count?.toLocaleString()} members</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-3">
          <button 
            onClick={handleViewAllTrending}
            disabled={isFetchingTrending}
            className="w-full flex items-center justify-center py-1.5 rounded-full bg-obsidian text-xs font-bold text-white/90 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {isFetchingTrending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'View All'}
          </button>
        </div>
      </div>

      {/* Rules Widget */}
      <div className="bg-obsidian border border-white/10 rounded-lg p-4 space-y-3">
        <h3 className="font-bold text-white/90 border-b border-white/10 pb-2">Forum Rules</h3>
        <ol className="list-decimal list-inside text-sm text-white/60 space-y-2">
          <li>Be respectful to fellow students.</li>
          <li>No sharing exact exam answers.</li>
          <li>Keep posts relevant to the community.</li>
          <li>Search before asking a question.</li>
          <li>Use appropriate tags.</li>
        </ol>
      </div>
    </aside>
  );
}
