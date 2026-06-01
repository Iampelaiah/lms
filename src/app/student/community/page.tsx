'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, Flag, 
  Flame, Sparkles, Clock, Trophy, Plus, LayoutGrid, List, X, Image as ImageIcon
} from 'lucide-react'

// --- Mock Data & Types ---
interface Community {
  id: string
  name: string
  description: string
  members_count?: number
}

interface Post {
  id: string
  community_id: string
  user_id: string
  title: string
  content: string
  tag: string
  image_url?: string | null
  votes: number
  created_at: string
  author_name?: string
  community_name?: string
}

const mockCommunities: Community[] = [
  { id: '1', name: 'A-Level Mathematics', description: 'Calculus, Algebra, and beyond.', members_count: 1240 },
  { id: '2', name: 'O-Level Biology', description: 'Cell biology, anatomy, ecosystems.', members_count: 890 },
  { id: '3', name: 'General Discussion', description: 'Talk about anything related to school.', members_count: 3400 },
]

const mockPosts: Post[] = [
  {
    id: 'p1',
    community_id: '1',
    user_id: 'u1',
    title: 'Need help understanding Integration by Parts',
    content: 'Can someone explain the LIATE rule in simple terms? I am struggling with choosing u and dv...',
    tag: 'Question',
    votes: 42,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    author_name: 'John Doe',
    community_name: 'A-Level Mathematics'
  },
  {
    id: 'p2',
    community_id: '3',
    user_id: 'u2',
    title: 'Study tips for finals week? 📚',
    content: 'What are your best strategies for avoiding burnout while reviewing a semester worth of notes?',
    tag: 'Discussion',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80',
    votes: 156,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    author_name: 'Jane Smith',
    community_name: 'General Discussion'
  }
]

// --- Components ---

const PostCard = ({ post }: { post: Post }) => {
  const [vote, setVote] = useState(0)
  
  return (
    <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors">
      {/* Vote Sidebar */}
      <div className="w-12 bg-zinc-900/50 flex flex-col items-center py-2 gap-1 border-r border-zinc-800">
        <button onClick={() => setVote(v => v === 1 ? 0 : 1)} className={`p-1 rounded hover:bg-zinc-800 transition-colors ${vote === 1 ? 'text-orange-500' : 'text-zinc-400'}`}>
          <ArrowBigUp className="w-6 h-6" fill={vote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-bold ${vote === 1 ? 'text-orange-500' : vote === -1 ? 'text-blue-500' : 'text-zinc-200'}`}>
          {post.votes + vote}
        </span>
        <button onClick={() => setVote(v => v === -1 ? 0 : -1)} className={`p-1 rounded hover:bg-zinc-800 transition-colors ${vote === -1 ? 'text-blue-500' : 'text-zinc-400'}`}>
          <ArrowBigDown className="w-6 h-6" fill={vote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-bold text-zinc-200 hover:underline cursor-pointer">{post.community_name}</span>
            <span>•</span>
            <span>Posted by u/{post.author_name}</span>
            <span>•</span>
            <span>2 hours ago</span> {/* Mock time formatting */}
          </div>

          {/* Title & Tag */}
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider mb-2 border border-orange-500/20">
              {post.tag}
            </span>
            <h2 className="text-lg font-semibold text-zinc-100">{post.title}</h2>
          </div>

          {/* Snippet */}
          <p className="text-sm text-zinc-400 line-clamp-3">
            {post.content}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pt-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-colors">
              <MessageSquare className="w-4 h-4" />
              12 Comments
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-colors">
              <Bookmark className="w-4 h-4" />
              Save
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-colors sm:ml-auto">
              <Flag className="w-4 h-4" />
              Report
            </button>
          </div>
        </div>

        {/* Optional Thumbnail */}
        {post.image_url && (
          <div className="hidden sm:block w-32 h-32 flex-shrink-0 rounded-md overflow-hidden border border-zinc-800">
            <img src={post.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudentForum() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeSort, setActiveSort] = useState('Hot')
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card')

  // Create Thread Form State
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadContent, setNewThreadContent] = useState('')
  const [newThreadTag, setNewThreadTag] = useState('Discussion')
  const [newThreadCommunity, setNewThreadCommunity] = useState('')

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault()
    // Trigger Server Action / Supabase insert here
    console.log({ newThreadTitle, newThreadContent, newThreadTag, newThreadCommunity })
    setIsCreateModalOpen(false)
    setNewThreadTitle('')
    setNewThreadContent('')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 pb-12">
      {/* Top Banner Area (Optional) */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-4 px-6 mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Student Community</h1>
      </div>

      <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-[20%_55%_25%] gap-6">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="hidden lg:block space-y-6">
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
        </aside>

        {/* --- MAIN FEED --- */}
        <main className="space-y-4">
          
          {/* Sort & Filter Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {['Best', 'Hot', 'New', 'Top'].map((sort) => {
                const isActive = activeSort === sort
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
                )
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
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-full transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Create Thread
            </button>
          </div>

          {/* Feed Content */}
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>

        {/* --- RIGHT SIDEBAR --- */}
        <aside className="hidden md:block space-y-6">
          
          {/* Create Post Button */}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-full transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Create Thread
          </button>

          {/* Trending Communities Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-800">
              <h3 className="font-bold text-zinc-200">Trending Subjects</h3>
            </div>
            <ul className="divide-y divide-zinc-800">
              {mockCommunities.slice(0, 3).map((comm, idx) => (
                <li key={comm.id} className="p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer flex items-center gap-3">
                  <span className="text-xl font-bold text-zinc-500">{idx + 1}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">{comm.name}</h4>
                    <p className="text-xs text-zinc-500">{comm.members_count?.toLocaleString()} members</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-3">
              <button className="w-full py-1.5 rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition-colors">
                View All
              </button>
            </div>
          </div>

          {/* Rules Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-zinc-200 border-b border-zinc-800 pb-2">Forum Rules</h3>
            <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-2">
              <li>Be respectful to fellow students.</li>
              <li>No sharing exact exam answers.</li>
              <li>Keep posts relevant to the community.</li>
              <li>Search before asking a question.</li>
              <li>Use appropriate tags.</li>
            </ol>
          </div>
        </aside>

      </div>

      {/* --- CREATE THREAD MODAL --- */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                <h2 className="text-lg font-bold text-zinc-100">Create a new thread</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateThread} className="p-6 space-y-5">
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Community Selector */}
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Choose Community</label>
                    <select 
                      required
                      value={newThreadCommunity}
                      onChange={(e) => setNewThreadCommunity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="" disabled>Select a subject...</option>
                      {mockCommunities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tag Selector */}
                  <div className="sm:w-1/3 space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tag</label>
                    <select 
                      value={newThreadTag}
                      onChange={(e) => setNewThreadTag(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="Discussion">Discussion</option>
                      <option value="Question">Question</option>
                      <option value="Showcase">Showcase</option>
                      <option value="Help">Help</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="An interesting title"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Content Area */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Body</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="What are your thoughts?"
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-orange-500 hover:bg-orange-500/10 transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    Add Image
                  </button>

                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 rounded-full text-sm font-bold text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 rounded-full text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
