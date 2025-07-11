import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MessageSquare, Heart, Share, Plus, Crown, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Community {
  id: string;
  name: string;
  description?: string;
  category?: string;
  privacy_level: string;
  created_by: string;
  member_count: number;
  created_at: string;
  is_member?: boolean;
  user_role?: string;
}

interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  content: string;
  post_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: {
    display_name?: string;
    avatar_url?: string;
  };
  user_liked?: boolean;
}

export default function ProviderCommunity() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: 'general',
    privacy_level: 'public'
  });

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'discussion'
  });

  useEffect(() => {
    if (user) {
      loadCommunities();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCommunity) {
      loadPosts(selectedCommunity);
    }
  }, [selectedCommunity]);

  const loadCommunities = async () => {
    try {
      const { data: communitiesData, error } = await supabase
        .from('provider_community')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;

      // Check membership status for each community
      if (communitiesData?.length) {
        const { data: memberships } = await supabase
          .from('community_members')
          .select('community_id, role')
          .eq('user_id', user?.id);

        const communitiesWithMembership = communitiesData.map(community => {
          const membership = memberships?.find(m => m.community_id === community.id);
          return {
            ...community,
            is_member: !!membership,
            user_role: membership?.role
          };
        });

        setCommunities(communitiesWithMembership);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (communityId: string) => {
    try {
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!community_posts_author_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user has liked each post
      if (postsData?.length) {
        const { data: interactions } = await supabase
          .from('post_interactions')
          .select('post_id')
          .eq('user_id', user?.id)
          .eq('interaction_type', 'like')
          .in('post_id', postsData.map(p => p.id));

        const postsWithLikes = postsData.map(post => ({
          ...post,
          author: post.profiles,
          user_liked: interactions?.some(i => i.post_id === post.id) || false
        }));

        setPosts(postsWithLikes);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    }
  };

  const createCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_community')
        .insert({
          ...newCommunity,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase
        .from('community_members')
        .insert({
          community_id: data.id,
          user_id: user?.id,
          role: 'admin'
        });

      setNewCommunity({
        name: '',
        description: '',
        category: 'general',
        privacy_level: 'public'
      });
      setIsCreatingCommunity(false);
      await loadCommunities();
      toast.success('Community created successfully');
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Failed to create community');
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user?.id,
          role: 'member'
        });

      if (error) throw error;
      await loadCommunities();
      toast.success('Joined community successfully');
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Failed to join community');
    }
  };

  const createPost = async () => {
    if (!selectedCommunity) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          ...newPost,
          community_id: selectedCommunity,
          author_id: user?.id
        });

      if (error) throw error;

      setNewPost({
        title: '',
        content: '',
        post_type: 'discussion'
      });
      setIsCreatingPost(false);
      await loadPosts(selectedCommunity);
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Unlike
        await supabase
          .from('post_interactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id)
          .eq('interaction_type', 'like');
      } else {
        // Like
        await supabase
          .from('post_interactions')
          .insert({
            post_id: postId,
            user_id: user?.id,
            interaction_type: 'like'
          });
      }

      await loadPosts(selectedCommunity!);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Provider Community</h2>
        </div>
        <Dialog open={isCreatingCommunity} onOpenChange={setIsCreatingCommunity}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>
                Start a new community for providers to connect and share
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="community-name">Community Name</Label>
                <Input
                  id="community-name"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Windhoek Plumbers"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this community about?"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newCommunity.category}
                  onValueChange={(value) => setNewCommunity(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="gardening">Gardening</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="privacy">Privacy Level</Label>
                <Select
                  value={newCommunity.privacy_level}
                  onValueChange={(value) => setNewCommunity(prev => ({ ...prev, privacy_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createCommunity} className="w-full">
                Create Community
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Communities List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Communities</CardTitle>
              <CardDescription>Join provider communities in your area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {communities.map((community) => (
                <div
                  key={community.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCommunity === community.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => setSelectedCommunity(community.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{community.name}</h4>
                    {community.user_role === 'admin' && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {community.description?.slice(0, 50)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {community.member_count} members
                    </Badge>
                    {!community.is_member && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          joinCommunity(community.id);
                        }}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Posts Feed */}
        <div className="lg:col-span-2">
          {selectedCommunity ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Community Posts</h3>
                {communities.find(c => c.id === selectedCommunity)?.is_member && (
                  <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                        <DialogDescription>
                          Share something with the community
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="post-title">Title</Label>
                          <Input
                            id="post-title"
                            value={newPost.title}
                            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="What's your post about?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="post-content">Content</Label>
                          <Textarea
                            id="post-content"
                            value={newPost.content}
                            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Share your thoughts..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="post-type">Post Type</Label>
                          <Select
                            value={newPost.post_type}
                            onValueChange={(value) => setNewPost(prev => ({ ...prev, post_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="discussion">Discussion</SelectItem>
                              <SelectItem value="question">Question</SelectItem>
                              <SelectItem value="tip">Tip/Advice</SelectItem>
                              <SelectItem value="announcement">Announcement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={createPost} className="w-full">
                          Create Post
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {posts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No posts yet. Be the first to start a conversation!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <CardDescription>
                              By {post.author?.display_name || 'Anonymous'} • {new Date(post.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {post.post_type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">{post.content}</p>
                        <div className="flex gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className={`gap-2 ${post.user_liked ? 'text-red-500' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-current' : ''}`} />
                            {post.likes_count}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {post.comments_count}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Share className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a community to view posts</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}