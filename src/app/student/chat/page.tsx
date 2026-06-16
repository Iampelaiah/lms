'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { getStudentChatContacts, getRecentChatContacts, getGlobalChatMessages, sendGlobalChatMessage, markMessagesAsRead, searchProfilesForChat } from '@/app/actions/chat';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Send, Loader2, User, MessageCircle, Video, Phone, Paperclip, Smile } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AgoraCall from '@/components/video/agora-call';

export default function StudentChatPage() {
  const { profile } = useUser();
  const supabase = createClient();
  
  // Contacts view state
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Active chat state
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Video Call State
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load contacts when page mounts
  useEffect(() => {
    if (profile?.id) {
      loadContacts();
    }
  }, [profile?.id]);

  // Handle incoming call from URL
  useEffect(() => {
    if (typeof window !== 'undefined' && profile?.id) {
      const params = new URLSearchParams(window.location.search);
      const callChannel = params.get('call');
      const partnerId = params.get('partner');
      
      if (callChannel && partnerId) {
        // Fetch partner profile if not already in contacts
        supabase.from('profiles').select('*').eq('id', partnerId).single()
          .then(({ data }) => {
            if (data) {
              handleSelectContact({ partnerId: partnerId, profile: data });
              setIsVideoCallActive(true);
              
              // Clean up URL so it doesn't rejoin on refresh
              window.history.replaceState({}, '', window.location.pathname);
            }
          });
      }
    }
  }, [profile?.id, supabase]);

  async function loadContacts() {
    if (!profile?.id) return;
    setLoadingContacts(true);
    
    // Fetch both assigned contacts and recent conversations
    const [{ data: assignedContacts }, { data: recentContacts }] = await Promise.all([
      getStudentChatContacts(profile.id),
      getRecentChatContacts(profile.id)
    ]);

    const mergedContactsMap = new Map<string, any>();

    // Add recent contacts first (these have message previews and timestamps)
    if (recentContacts) {
      for (const rc of recentContacts) {
        mergedContactsMap.set(rc.partnerId, rc);
      }
    }

    // Add assigned contacts if they aren't already in the list
    if (assignedContacts) {
      for (const ac of assignedContacts) {
        if (!mergedContactsMap.has(ac.partnerId)) {
           mergedContactsMap.set(ac.partnerId, ac);
        }
      }
    }

    // Sort: Contacts with recent messages first (descending time), then others
    const finalContacts = Array.from(mergedContactsMap.values()).sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      }
      if (a.lastMessageTime) return -1;
      if (b.lastMessageTime) return 1;
      return 0;
    });

    setContacts(finalContacts);
    setLoadingContacts(false);
  }

  // Handle Real-time Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      const { data } = await searchProfilesForChat(searchQuery);
      if (data) {
        setSearchResults(data.filter((p: any) => p.id !== profile?.id));
      }
      setSearching(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, profile?.id]);

  // Load messages when a partner is selected
  useEffect(() => {
    if (activePartnerId && profile?.id) {
      loadMessages();
      markAsRead();
    }
  }, [activePartnerId, profile?.id]);

  async function loadMessages() {
    if (!profile?.id || !activePartnerId) return;
    setLoadingMessages(true);
    const { data } = await getGlobalChatMessages(profile.id, activePartnerId);
    if (data) setMessages(data);
    else setMessages([]);
    setLoadingMessages(false);
  }

  async function markAsRead() {
    if (!profile?.id || !activePartnerId) return;
    await markMessagesAsRead(profile.id, activePartnerId);
    setContacts(prev => prev.map(c => 
      c.partnerId === activePartnerId ? { ...c, unread: false } : c
    ));
  }

  // Real-time subscription for global messages
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`student_chat_page_${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'global_messages'
      }, (payload) => {
        const newMsg = payload.new;
        if (
          activePartnerId && 
          ((newMsg.sender_id === profile.id && newMsg.receiver_id === activePartnerId) ||
           (newMsg.sender_id === activePartnerId && newMsg.receiver_id === profile.id))
        ) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_id === activePartnerId) {
            markAsRead();
          }
        } else {
          // Could refresh contacts here to show unread dot
          loadContacts();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, activePartnerId]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !profile?.id || !activePartnerId) return;

    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage('');
    
    const { data } = await sendGlobalChatMessage(profile.id, activePartnerId, msgText);
    if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
    setSending(false);
  }

  function handleSelectContact(contact: any) {
    setActivePartnerId(contact.partnerId);
    setActivePartner(contact.profile);
    setSearchQuery('');
  }

  const filteredContacts = contacts.filter(c => 
    c.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 bg-neutral-50/50 dark:bg-background/10 min-h-[calc(100vh-4rem)] p-2 sm:p-6 rounded-[2rem]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Messages & Virtual Classes
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Connect with your tutors and parents.
          </p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-14rem)] rounded-[2rem] overflow-hidden bg-card border border-border shadow-sm">
        {/* Sidebar: Contacts */}
        {!isVideoCallActive && (
          <div className="w-80 border-r border-border flex flex-col bg-neutral-50/50 dark:bg-background/50">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold mb-4">Connections</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search people..." 
                  className="pl-9 bg-background" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {searchQuery.trim() ? (
                <div className="flex flex-col">
                  {searching ? (
                     <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No users found.
                    </div>
                  ) : (
                    searchResults.map((user) => (
                      <div 
                        key={user.id}
                        onClick={() => handleSelectContact({ partnerId: user.id, profile: user })}
                        className={`flex items-center gap-3 p-4 cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`} />
                          <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate">{user.full_name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  {loadingContacts ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No connections found.
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div 
                        key={contact.partnerId}
                        onClick={() => handleSelectContact(contact)}
                        className={`flex items-center gap-3 p-4 cursor-pointer border-b border-border/50 transition-colors ${
                          activePartnerId === contact.partnerId ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.profile?.full_name}`} />
                          <AvatarFallback>{contact.profile?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm truncate text-foreground">{contact.profile?.full_name}</span>
                            {contact.lastMessageTime && (
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                {format(new Date(contact.lastMessageTime), 'h:mm a')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                              {contact.lastMessage || 'Start a conversation'}
                            </span>
                            {contact.unread && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Video Call Area */}
        {isVideoCallActive && activePartnerId && profile?.id && (
           <div className="flex-1 bg-black relative flex flex-col">
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                 <h2 className="text-white text-lg font-bold drop-shadow-md">Virtual Class with {activePartner?.full_name}</h2>
                 <p className="text-white/70 text-sm drop-shadow-md">Live Session</p>
              </div>
              <AgoraCall 
                channelName={`class_${profile.id.replace(/-/g, '').substring(0, 16)}_${activePartnerId.replace(/-/g, '').substring(0, 16)}`} 
                onEndCall={() => setIsVideoCallActive(false)} 
              />
           </div>
        )}

        {/* Chat Area */}
        {activePartner ? (
          <div className={`flex flex-col bg-background ${isVideoCallActive ? 'w-80 md:w-96 border-l border-border shrink-0' : 'flex-1'}`}>
            <div className="p-4 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={activePartner.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePartner.full_name}`} />
                  <AvatarFallback>{activePartner.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground leading-none mb-1">{activePartner.full_name}</h3>
                  <span className="text-xs text-muted-foreground capitalize">{activePartner.role}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={isVideoCallActive ? "default" : "ghost"} 
                  size="icon" 
                  className={isVideoCallActive ? "bg-[#D9ED92] text-[#0B0C10] hover:bg-[#E8C85E]" : "text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"}
                  onClick={() => setIsVideoCallActive(!isVideoCallActive)}
                >
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#D4AF37]" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 opacity-20 mb-4" />
                    <p>No messages yet.</p>
                    <p className="text-sm">Say hello to {activePartner.full_name.split(' ')[0]}!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === profile?.id;
                    const isTutor = activePartner.role === 'tutor';
                    return (
                      <div key={msg.id} className={`flex items-start gap-2 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`px-4 py-2 text-sm shadow-sm ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-[1.2rem] rounded-br-sm border-primary/50' 
                            : isTutor 
                              ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] rounded-[1.2rem] rounded-bl-sm'
                              : 'bg-muted rounded-[1.2rem] rounded-bl-sm border border-muted-foreground/10 text-foreground'
                        }`}>
                          {msg.message}
                          <div className={`text-[9px] mt-1 opacity-70 ${isMe ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                            {format(new Date(msg.created_at), 'h:mm a')}
                            {isMe && <span className="ml-1 text-[10px]">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 border-t border-border bg-neutral-50/50 dark:bg-background/50">
              <div className="flex gap-2 max-w-4xl mx-auto items-center">
                <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="relative flex-1">
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-background border-border focus-visible:ring-1 rounded-full h-12 pl-4 pr-12"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <Button type="submit" size="icon" disabled={!newMessage.trim() || sending} className="h-12 w-12 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 opacity-50" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your Messages</h2>
            <p className="text-sm max-w-[250px] text-center">Select a contact from the sidebar to view your conversation or start a new virtual class.</p>
          </div>
        )}
      </div>
    </div>
  );
}
