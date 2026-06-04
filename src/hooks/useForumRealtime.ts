import { useEffect, useState, useCallback } from 'react';
import { Post, CommentType } from '../app/student/community/types';
import { createClient } from '@/utils/supabase/client';

export function useForumRealtime(initialPosts: Post[] = []) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  // Load from Supabase on mount if we didn't get them via SSR
  useEffect(() => {
    const fetchPosts = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          id, community_id, user_id, title, content, tag, image_url, votes, created_at,
          profiles!forum_posts_user_id_fkey (full_name, avatar_url),
          forum_communities (name)
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', JSON.stringify(postsError, null, 2));
        return;
      }

      const { data: commentsData, error: commentsError } = await supabase
        .from('forum_comments')
        .select(`
          id, post_id, user_id, text, created_at,
          profiles!forum_comments_user_id_fkey (full_name)
        `)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      }

      const formattedPosts: Post[] = postsData.map((p: any) => ({
        id: p.id,
        community_id: p.community_id,
        user_id: p.user_id,
        title: p.title,
        content: p.content,
        tag: p.tag,
        image_url: p.image_url,
        votes: p.votes,
        created_at: p.created_at,
        author_name: p.profiles?.full_name || 'Anonymous',
        community_name: p.forum_communities?.name || 'Unknown Community',
        comments: (commentsData || [])
          .filter((c: any) => c.post_id === p.id)
          .map((c: any) => ({
            id: c.id,
            text: c.text,
            author: c.profiles?.full_name || 'Anonymous',
          })),
      }));

      setPosts(formattedPosts);
      setIsLoaded(true);
    };

    fetchPosts();
  }, [supabase]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:forum_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // We need to fetch the author and community name, but for now we can just add the raw post 
          // and let the next full fetch resolve relations, or handle it optimistically.
          const newPost = payload.new as any;
          setPosts(current => {
            if (current.some(p => p.id === newPost.id)) return current;
            return [{
              id: newPost.id,
              community_id: newPost.community_id,
              user_id: newPost.user_id,
              title: newPost.title,
              content: newPost.content,
              tag: newPost.tag,
              image_url: newPost.image_url,
              votes: newPost.votes,
              created_at: newPost.created_at,
              author_name: 'Loading...',
              community_name: 'Loading...',
              comments: []
            }, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setPosts(current => current.map(p => p.id === payload.new.id ? { ...p, votes: payload.new.votes } : p));
        } else if (payload.eventType === 'DELETE') {
          setPosts(current => current.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_comments' }, (payload) => {
        const newComment = payload.new as any;
        setPosts(current => current.map(p => {
          if (p.id === newComment.post_id) {
            const exists = p.comments?.some(c => c.id === newComment.id);
            if (exists) return p;
            return {
              ...p,
              comments: [...(p.comments || []), { id: newComment.id, text: newComment.text, author: 'Loading...' }]
            };
          }
          return p;
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const broadcastNewPost = useCallback(async (post: Post) => {
    // Optimistic update
    setPosts(current => [post, ...current]);
    
    const currentUser = (await supabase.auth.getUser()).data.user?.id;
    const finalUserId = (post.user_id && post.user_id !== 'current_user') ? post.user_id : currentUser;

    // For images, we would ideally upload to storage here
    const { error } = await supabase.from('forum_posts').insert({
      id: post.id,
      community_id: post.community_id,
      user_id: finalUserId,
      title: post.title,
      content: post.content,
      tag: post.tag,
      image_url: post.image_url,
      votes: post.votes,
      created_at: post.created_at
    });
    if (error) console.error("Error creating post:", JSON.stringify(error, null, 2));
  }, [supabase]);

  const broadcastVoteUpdate = useCallback(async (postId: string, newVotes: number) => {
    // Optimistic update
    setPosts(current => current.map(p => p.id === postId ? { ...p, votes: newVotes } : p));
    
    const { error } = await supabase.from('forum_posts').update({ votes: newVotes }).eq('id', postId);
    if (error) console.error("Error updating votes:", JSON.stringify(error, null, 2));
  }, [supabase]);

  const broadcastNewComment = useCallback(async (postId: string, comment: CommentType) => {
    // Optimistic update
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...(p.comments || []), comment] };
      }
      return p;
    }));
    
    const { error } = await supabase.from('forum_comments').insert({
      id: comment.id,
      post_id: postId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      text: comment.text,
    });
    if (error) console.error("Error creating comment:", JSON.stringify(error, null, 2));
  }, [supabase]);

  const broadcastDeletePost = useCallback(async (postId: string) => {
    // Optimistic update
    setPosts(current => current.filter(p => p.id !== postId));
    
    const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
    if (error) console.error("Error deleting post:", JSON.stringify(error, null, 2));
  }, [supabase]);

  return {
    posts,
    setPosts,
    broadcastNewPost,
    broadcastVoteUpdate,
    broadcastNewComment,
    broadcastDeletePost,
    isLoaded
  };
}
