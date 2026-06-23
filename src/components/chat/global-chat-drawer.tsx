'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { searchProfilesForChat, getRecentChatContacts, getGlobalChatMessages, sendGlobalChatMessage, markMessagesAsRead, getStudentChatContacts, getTutorChatContacts } from '@/app/actions/chat';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Send, ArrowLeft, Loader2, User, Plus, MessageSquare, Sparkles, Paperclip, Smile } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function GlobalChatDrawer({ trigger }: { trigger: React.ReactNode }) {
  const { profile } = useUser();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // Contacts view state
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  // Search / New Message mode state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [isNewMessageMode, setIsNewMessageMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'tutors' | 'peers'>('all');
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active chat state
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load contacts when drawer opens
  useEffect(() => {
    if (isOpen && profile?.id && !activePartnerId) {
      loadContacts();
    }
  }, [isOpen, profile?.id, activePartnerId]);

  async function loadContacts() {
    if (!profile?.id) return;
    setLoadingContacts(true);
    
    let assignedContactsFetch: Promise<{ data: any[] }> = Promise.resolve({ data: [] });
    if (profile.role === 'student') {
      assignedContactsFetch = getStudentChatContacts(profile.id);
    } else if (profile.role === 'tutor') {
      assignedContactsFetch = getTutorChatContacts(profile.id);
    }

    const [{ data: assignedContacts }, { data: recentContacts }] = await Promise.all([
      assignedContactsFetch,
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
      for (const ac of assignedContacts as any[]) {
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

  // Handle Search / Default New Message lists
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (isNewMessageMode && profile?.id) {
        loadAllProfiles();
      } else {
        setSearchResults([]);
      }
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      const { data } = await searchProfilesForChat(searchQuery);
      if (data) {
        // Exclude self
        setSearchResults(data.filter((p: any) => p.id !== profile?.id));
      }
      setSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, profile?.id, isNewMessageMode]);

  async function loadAllProfiles() {
    if (!profile?.id) return;
    setSearching(true);
    const { data } = await searchProfilesForChat('');
    if (data) {
      setSearchResults(data.filter((p: any) => p.id !== profile?.id));
    }
    setSearching(false);
  }

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
    // update contacts list visually
    setContacts(prev => prev.map(c => 
      c.partnerId === activePartnerId ? { ...c, unread: false } : c
    ));
  }

  // Real-time subscription for global messages
  useEffect(() => {
    if (!profile?.id || !isOpen) return;

    const channel = supabase
      .channel(`global_chat_${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'global_messages'
      }, (payload) => {
        const newMsg = payload.new;
        // If it's related to the active chat, add it
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
            markAsRead(); // immediately mark read if open
          }
        } else {
          // If it's from someone else, refresh contacts to show new unread
          loadContacts();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, isOpen, activePartnerId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loadingMessages]);

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
      loadContacts(); // Update recent message in list
    }
    setSending(false);
  }

  function handleSelectContact(contact: any) {
    setActivePartnerId(contact.partnerId);
    setActivePartner(contact.profile);
    setSearchQuery('');
    setIsNewMessageMode(false);
  }

  function handleSelectSearchResult(userProfile: any) {
    setActivePartnerId(userProfile.id);
    setActivePartner(userProfile);
    setSearchQuery('');
    setIsNewMessageMode(false);
  }

  function handleNewMessageClick() {
    setIsNewMessageMode(true);
    setActivePartnerId(null);
    setActivePartner(null);
    setSearchQuery('');
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  }

  function handleCancelNewMessage() {
    setIsNewMessageMode(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  // Formatting contact role or classmate label
  function getContactDescriptor(userProfile: any) {
    if (!userProfile) return '';
    if (userProfile.role === 'tutor') {
      const ts = userProfile.tutor_subjects;
      if (Array.isArray(ts) && ts.length > 0) {
        const subjectName = ts[0]?.subjects?.name;
        if (subjectName) return `${subjectName} Tutor`;
      }
      return 'Tutor';
    }
    if (userProfile.role === 'student') {
      return 'Classmate';
    }
    return userProfile.role || '';
  }

  // Filtering lists
  const filteredContacts = contacts.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'tutors') return c.profile?.role === 'tutor';
    if (filter === 'peers') return c.profile?.role === 'student';
    return true;
  });

  const filteredSearchResults = searchResults.filter((u) => {
    if (filter === 'all') return true;
    if (filter === 'tutors') return u.role === 'tutor';
    if (filter === 'peers') return u.role === 'student';
    return true;
  });

  const isSearchOrNewActive = isNewMessageMode || searchQuery.trim().length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-[850px] p-0 flex flex-col h-full bg-background border-l border-border overflow-hidden">
        {/* Screen Reader Accessible Titles */}
        <div className="sr-only">
          <SheetTitle>Messages</SheetTitle>
          <SheetDescription>Directly message your students and peers.</SheetDescription>
        </div>
        <div className="flex flex-row w-full h-full overflow-hidden flex-1">
          
          {/* ─── SIDEBAR (Left Column) ─── */}
          <div className={cn(
            "w-full md:w-[340px] flex-shrink-0 border-r border-border flex flex-col h-full bg-card/40 transition-all duration-300",
            activePartnerId && "hidden md:flex"
          )}>
            
            {/* Header Area */}
            <div className="p-4 border-b border-border space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-foreground font-headline">Messages</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Directly message your students and peers.</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium flex items-center gap-1.5 rounded-lg text-xs transition-all duration-200 shadow-md shadow-primary/10"
                  onClick={handleNewMessageClick}
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  <span>New Message</span>
                </Button>
              </div>
              
              {/* Search contacts bar */}
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search contacts..." 
                  className={cn(
                    "pl-9 bg-muted/65 border-border text-sm h-9.5 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-muted/30 transition-all",
                    isSearchOrNewActive ? "pr-16" : ""
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  ref={searchInputRef}
                />
                {isSearchOrNewActive && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleCancelNewMessage}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 bg-muted/40 p-1 rounded-lg">
                {(['all', 'tutors', 'peers'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={cn(
                      "flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all duration-200 capitalize",
                      filter === tab 
                        ? "bg-background text-foreground shadow-sm scale-[1.02]" 
                        : "text-muted-foreground hover:text-foreground/80"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List Body */}
            <ScrollArea className="flex-1 bg-card/10">
              <div className="p-2 space-y-1">
                {isSearchOrNewActive ? (
                  // Search Results / Contact Discovery Mode
                  searching ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                  ) : filteredSearchResults.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs">
                      No contacts found matching criteria.
                    </div>
                  ) : (
                    filteredSearchResults.map((user) => (
                      <div 
                        key={user.id}
                        onClick={() => handleSelectSearchResult(user)}
                        className="flex items-center gap-3 p-3 mx-1 my-0.5 rounded-xl cursor-pointer hover:bg-muted/40 border border-transparent hover:border-border/30 transition-all duration-200"
                      >
                        <Avatar className="h-9 w-9 border border-border/50">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback><User size={15} className="text-muted-foreground" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm text-foreground truncate block">
                            {user.full_name || 'Unknown User'}
                          </span>
                          <p className="text-[11px] text-muted-foreground/80 capitalize font-medium">
                            {getContactDescriptor(user)}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-muted/30 border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )
                ) : (
                  // Recent Contacts View
                  loadingContacts ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="p-8 flex flex-col items-center text-center text-muted-foreground space-y-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 opacity-40" />
                      </div>
                      <p className="text-sm font-semibold">No messages yet.</p>
                      <p className="text-xs max-w-[200px] text-muted-foreground/80">
                        Use the "New Message" button or search contacts to begin a chat!
                      </p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => {
                      const isActive = activePartnerId === contact.partnerId;
                      const isPartnerTutor = contact.profile?.role === 'tutor';
                      
                      return (
                        <div 
                          key={contact.partnerId}
                          onClick={() => handleSelectContact(contact)}
                          className={cn(
                            "flex items-center gap-3 p-3 mx-1 my-0.5 rounded-xl cursor-pointer transition-all duration-200 border",
                            isActive 
                              ? "bg-primary/5 border-primary/20 text-foreground" 
                              : "hover:bg-muted/40 border-transparent hover:border-border/30 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <div className="relative">
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarImage src={contact.profile?.avatar_url} />
                              <AvatarFallback><User size={15}/></AvatarFallback>
                            </Avatar>
                            {/* Tutor badge decoration */}
                            {isPartnerTutor && (
                              <div className="absolute -bottom-1 -right-1.5 bg-[#D4AF37] text-black font-extrabold text-[8px] px-1 rounded-sm border border-background scale-80 leading-3">TUTOR</div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <span className={cn(
                                "text-sm truncate",
                                isActive ? "font-bold text-primary" : "font-semibold text-foreground"
                              )}>
                                {contact.profile?.full_name || 'Unknown User'}
                              </span>
                              <span className="text-[10px] text-muted-foreground/70 font-medium ml-1">
                                {format(new Date(contact.lastMessageTime), 'h:mm a')}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <p className={cn(
                                "text-xs truncate pr-3 flex-1",
                                contact.unread ? "text-foreground font-semibold" : "text-muted-foreground/80"
                              )}>
                                {contact.lastMessage}
                              </p>
                              {contact.unread && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </ScrollArea>
          </div>

          {/* ─── CHAT AREA (Right Column) ─── */}
          <div className={cn(
            "flex-1 flex flex-col h-full bg-muted/10 transition-all duration-300",
            !activePartnerId && "hidden md:flex"
          )}>
            
            {activePartnerId ? (
              // Active Conversation Open
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 border-b border-border bg-card/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8.5 w-8.5 md:hidden" 
                      onClick={() => setActivePartnerId(null)}
                    >
                      <ArrowLeft size={18} />
                    </Button>
                    <Avatar className="h-9 w-9 border border-border/50">
                      <AvatarImage src={activePartner?.avatar_url} />
                      <AvatarFallback><User size={15} /></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-sm leading-tight text-foreground">{activePartner?.full_name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[11px] text-muted-foreground capitalize font-medium">
                          {getContactDescriptor(activePartner)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Stream */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4 flex flex-col" ref={scrollRef}>
                    {loadingMessages ? (
                      <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 my-auto">
                        <div className="p-3 bg-muted/50 rounded-full border border-border/40 text-muted-foreground/80">
                          <Sparkles size={20} className="text-primary animate-pulse" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Secure Workspace Chat</p>
                        <p className="text-xs text-muted-foreground max-w-[240px]">
                          Start typing below to say hello and collaborate!
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.sender_id === profile?.id;
                        const isPartnerTutor = !isMe && activePartner?.role === 'tutor';

                        if (isMe) {
                          // Outgoing Message (Gold bubble on the right, no avatar)
                          return (
                            <div key={msg.id} className="flex justify-end items-start">
                              <div className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm border border-primary/20 bg-primary text-primary-foreground rounded-tr-none">
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                <div className="text-[9px] mt-1 text-right opacity-80 font-medium">
                                  {format(new Date(msg.created_at), 'h:mm a')}
                                  <span className="ml-1 text-[10px]">✓✓</span>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          // Incoming Message (Dark bubble on the left, partner's avatar)
                          return (
                            <div key={msg.id} className="flex justify-start items-start gap-2">
                              <Avatar className="h-7 w-7 mt-0.5 border border-border/60 flex-shrink-0">
                                <AvatarImage src={activePartner?.avatar_url} />
                                <AvatarFallback><User size={12} /></AvatarFallback>
                              </Avatar>
                              
                              <div className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm border rounded-tl-none",
                                isPartnerTutor
                                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/25 text-[#D4AF37]"
                                  : "bg-muted border-border/40 text-foreground"
                              )}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                <div className="text-[9px] mt-1 text-right opacity-70 font-medium">
                                  {format(new Date(msg.created_at), 'h:mm a')}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* Input Text Form */}
                <form onSubmit={handleSend} className="p-3 border-t border-border bg-card/30">
                  <div className="flex gap-2 items-center">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="relative flex-1">
                      <Input 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="bg-muted border-border/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-muted/40 transition-all h-9.5 text-sm pr-10 rounded-full"
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!newMessage.trim() || sending} 
                      className="shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground h-9.5 w-9.5 rounded-full shadow-sm"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              // Empty State (Desktop placeholder when no conversation is selected)
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card/5">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center border border-border mb-4 animate-bounce duration-1000">
                  <MessageSquare className="w-7 h-7 text-primary opacity-60" />
                </div>
                <h3 className="text-base font-bold text-foreground font-headline">School Messaging Workspace</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
                  Select a chat from your list on the left, or search contacts to send a direct message.
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-4 border-border text-xs gap-1.5"
                  onClick={handleNewMessageClick}
                >
                  <Plus size={12} />
                  <span>Start New Conversation</span>
                </Button>
              </div>
            )}
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
