import React, { useState, useRef } from 'react';
import { Post, mockCommunities } from '../types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';

interface CreateThreadModalProps {
  onClose: () => void;
  onSubmit: (post: Post) => void;
}

export function CreateThreadModal({ onClose, onSubmit }: CreateThreadModalProps) {
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadTag, setNewThreadTag] = useState('Discussion');
  const [newThreadCommunity, setNewThreadCommunity] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) return;

    // Create a local preview URL from the selected file
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCommunity = mockCommunities.find(c => c.id === newThreadCommunity);

    const newPost: Post = {
      id: crypto.randomUUID(),
      community_id: newThreadCommunity,
      user_id: 'current_user',
      title: newThreadTitle,
      content: newThreadContent,
      tag: newThreadTag,
      votes: 0,
      created_at: new Date().toISOString(),
      author_name: 'You',
      community_name: selectedCommunity?.name || 'Unknown',
      image_url: imagePreview,
    };

    onSubmit(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-lg font-bold text-zinc-100">Create a new thread</h2>
          <button 
            onClick={onClose}
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
                className="w-full bg-obsidian border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
                className="w-full bg-obsidian border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
              className="w-full bg-obsidian border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
              className="w-full bg-obsidian border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative group rounded-lg overflow-hidden border border-zinc-800">
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                className="w-full max-h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-2 bg-red-600 hover:bg-burgundy text-white text-sm font-bold px-4 py-2 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-orange-500 hover:bg-orange-500/10 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              {imagePreview ? 'Change Image' : 'Add Image'}
            </button>

            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={onClose}
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
  );
}



