import { createClient, SupabaseClient, AuthError, PostgrestError } from '@supabase/supabase-js';
import type { VsPost, User, Comment, VsOption } from '../types';

// Initialize Supabase client
const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || '';
const supabaseAnonKey = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to env.js');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TYPE DEFINITIONS
// ============================================

interface DatabaseProfile {
  id: string;
  email: string;
  name: string;
  bio: string;
  profile_image_url: string | null;
  avatar_initial: string;
  created_at: string;
  updated_at: string;
}

interface DatabasePost {
  id: string;
  author_id: string;
  type: 'classic' | 'match-up';
  title: string;
  topic: string;
  aspect_ratio?: '1/1.2' | '1/1.5';
  option_a_name: string;
  option_a_image: string;
  option_a_votes: number;
  option_a_background_color?: string;
  option_a_transform?: any;
  option_b_name: string;
  option_b_image: string;
  option_b_votes: number;
  option_b_background_color?: string;
  option_b_transform?: any;
  likes: number;
  shares: number;
  challengers?: any;
  initial_challengers?: any;
  eliminated?: any;
  champion?: any;
  round_results?: any;
  created_at: string;
  updated_at: string;
}

// ============================================
// AUTHENTICATION
// ============================================

export const auth = {
  async signUp(email: string, password: string, name: string) {
    console.log('🔵 Starting signup for:', email);
    
    // Step 1: Create auth user with name in metadata
    // Profile will be auto-created by database trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });

    if (authError) {
      console.error('🔴 Signup auth error:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('🔴 No user returned from signup');
      throw new Error('Signup failed - no user returned');
    }

    console.log('✅ Auth user created:', authData.user.id);
    console.log('⏳ Waiting for profile to be created by database trigger...');
    
    // Step 2: Wait for profile to be created by trigger (with retry)
    let profile = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!profile && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms
      
      console.log(`🔵 Checking for profile (attempt ${attempts}/${maxAttempts})...`);
      profile = await profiles.getProfile(authData.user.id);
      
      if (profile) {
        console.log('✅ Profile found:', profile.name);
        break;
      }
    }
    
    if (!profile) {
      console.error('🔴 Profile was not created by trigger');
      await supabase.auth.signOut();
      throw new Error('Profile creation failed - please try again');
    }
    
    return { user: authData.user, profile };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ============================================
// PROFILES / USERS
// ============================================

export const profiles = {
  async getProfile(userId: string, retries = 0): Promise<User | null> {
    console.log('🔵 Fetching profile for user ID:', userId);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('🔴 Profile fetch error:', error);
      return null;
    }
    
    if (!profile) {
      console.warn('⚠️ No profile found for user:', userId);
      return null;
    }
    
    console.log('✅ Profile data retrieved:', profile.name);

    const [savedPosts, following, followers] = await Promise.all([
      supabase.from('saved_posts').select('post_id').eq('user_id', userId),
      supabase.from('follows').select('following_id').eq('follower_id', userId),
      supabase.from('follows').select('follower_id').eq('following_id', userId),
    ]);

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      profileImageUrl: profile.profile_image_url || '',
      bio: profile.bio,
      avatarInitial: profile.avatar_initial,
      savedPostIds: new Set(savedPosts.data?.map((s) => s.post_id) || []),
      following: new Set(following.data?.map((f) => f.following_id) || []),
      followers: new Set(followers.data?.map((f) => f.follower_id) || []),
    };
  },

  async updateProfile(userId: string, updates: Partial<DatabaseProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllProfiles(): Promise<User[]> {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!profiles) return [];

    return Promise.all(
      profiles.map(async (profile) => {
        const [savedPosts, following, followers] = await Promise.all([
          supabase.from('saved_posts').select('post_id').eq('user_id', profile.id),
          supabase.from('follows').select('following_id').eq('follower_id', profile.id),
          supabase.from('follows').select('follower_id').eq('following_id', profile.id),
        ]);

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          profileImageUrl: profile.profile_image_url || '',
          bio: profile.bio,
          avatarInitial: profile.avatar_initial,
          savedPostIds: new Set(savedPosts.data?.map((s) => s.post_id) || []),
          following: new Set(following.data?.map((f) => f.following_id) || []),
          followers: new Set(followers.data?.map((f) => f.follower_id) || []),
        };
      })
    );
  },
};

// ============================================
// POSTS
// ============================================

export const posts = {
  async getAllPosts(): Promise<VsPost[]> {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(id, name, profile_image_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!postsData) return [];

    const currentUser = await auth.getCurrentUser();
    const userId = currentUser?.id;

    return Promise.all(
      postsData.map(async (post) => {
        const [comments, userVote, voteCounts] = await Promise.all([
          getCommentsForPost(post.id),
          userId ? getUserVoteForPost(userId, post.id) : null,
          getVoteCountsForPost(post.id),
        ]);

        return transformDatabasePostToVsPost(post, comments, userVote, voteCounts);
      })
    );
  },

  async getPost(postId: string): Promise<VsPost | null> {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(id, name, profile_image_url)
      `)
      .eq('id', postId)
      .single();

    if (error || !post) return null;

    const currentUser = await auth.getCurrentUser();
    const userId = currentUser?.id;

    const [comments, userVote, voteCounts] = await Promise.all([
      getCommentsForPost(post.id),
      userId ? getUserVoteForPost(userId, post.id) : null,
      getVoteCountsForPost(post.id),
    ]);

    return transformDatabasePostToVsPost(post, comments, userVote, voteCounts);
  },

  async createPost(authorId: string, postData: Partial<DatabasePost>) {
    const { data, error } = await supabase
      .from('posts')
      .insert([{ ...postData, author_id: authorId }])
      .select(`
        *,
        author:profiles!author_id(id, name, profile_image_url)
      `)
      .single();

    if (error) throw error;
    const voteCounts = await getVoteCountsForPost(data.id);
    return transformDatabasePostToVsPost(data, [], null, voteCounts);
  },

  async updatePost(postId: string, updates: Partial<DatabasePost>) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select(`
        *,
        author:profiles!author_id(id, name, profile_image_url)
      `)
      .single();

    if (error) throw error;

    const [comments, currentUser, voteCounts] = await Promise.all([
      getCommentsForPost(postId),
      auth.getCurrentUser(),
      getVoteCountsForPost(postId),
    ]);
    const userVote = currentUser ? await getUserVoteForPost(currentUser.id, postId) : null;

    return transformDatabasePostToVsPost(data, comments, userVote, voteCounts);
  },

  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  async checkDuplicateBattle(optionAName: string, optionBName: string, excludePostId?: string): Promise<boolean> {
    const formattedA = optionAName.trim().toLowerCase();
    const formattedB = optionBName.trim().toLowerCase();
    
    // Query for classic posts only - check both orderings (A vs B and B vs A)
    let query = supabase
      .from('posts')
      .select('id, option_a_name, option_b_name')
      .eq('type', 'classic');
    
    // Exclude current post if editing
    if (excludePostId) {
      query = query.neq('id', excludePostId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error checking for duplicates:', error);
      return false; // Don't block creation on error
    }
    
    if (!data) return false;
    
    // Check if any existing post matches (in either order)
    return data.some(post => {
      const existingA = (post.option_a_name || '').trim().toLowerCase();
      const existingB = (post.option_b_name || '').trim().toLowerCase();
      
      return (
        (formattedA === existingA && formattedB === existingB) ||
        (formattedA === existingB && formattedB === existingA)
      );
    });
  },

  async getPostsByAuthor(authorId: string): Promise<VsPost[]> {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(id, name, profile_image_url)
      `)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!postsData) return [];

    const currentUser = await auth.getCurrentUser();
    const userId = currentUser?.id;

    return Promise.all(
      postsData.map(async (post) => {
        const [comments, userVote, voteCounts] = await Promise.all([
          getCommentsForPost(post.id),
          userId ? getUserVoteForPost(userId, post.id) : null,
          getVoteCountsForPost(post.id),
        ]);

        return transformDatabasePostToVsPost(post, comments, userVote, voteCounts);
      })
    );
  },
};

// ============================================
// VOTES
// ============================================

export const votes = {
  async vote(userId: string, postId: string, option: 'A' | 'B') {
    const { error } = await supabase
      .from('votes')
      .upsert([{ user_id: userId, post_id: postId, option }], {
        onConflict: 'user_id,post_id',
      });

    if (error) throw error;
  },

  async unvote(userId: string, postId: string) {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
  },

  async getUserVotedPosts(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('post_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map((v) => v.post_id) || [];
  },
};

// ============================================
// COMMENTS
// ============================================

export const comments = {
  async addComment(postId: string, authorId: string, text: string, parentId?: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        author_id: authorId,
        text,
        parent_id: parentId || null,
      }])
      .select(`
        *,
        author:profiles!author_id(name, profile_image_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  async likeComment(userId: string, commentId: string) {
    const { error } = await supabase
      .from('comment_likes')
      .insert([{ user_id: userId, comment_id: commentId }]);

    if (error) throw error;
  },

  async unlikeComment(userId: string, commentId: string) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', userId)
      .eq('comment_id', commentId);

    if (error) throw error;
  },
};

// ============================================
// SAVED POSTS
// ============================================

export const savedPosts = {
  async savePost(userId: string, postId: string) {
    const { error } = await supabase
      .from('saved_posts')
      .insert([{ user_id: userId, post_id: postId }]);

    if (error) throw error;
  },

  async unsavePost(userId: string, postId: string) {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
  },

  async getSavedPosts(userId: string): Promise<VsPost[]> {
    const { data: savedPostIds, error } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', userId);

    if (error) throw error;
    if (!savedPostIds || savedPostIds.length === 0) return [];

    const postIds = savedPostIds.map((s) => s.post_id);
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(id, name, profile_image_url)
      `)
      .in('id', postIds)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;
    if (!postsData) return [];

    return Promise.all(
      postsData.map(async (post) => {
        const [comments, userVote, voteCounts] = await Promise.all([
          getCommentsForPost(post.id),
          getUserVoteForPost(userId, post.id),
          getVoteCountsForPost(post.id),
        ]);

        return transformDatabasePostToVsPost(post, comments, userVote, voteCounts);
      })
    );
  },
};

// ============================================
// FOLLOWS
// ============================================

export const follows = {
  async follow(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }]);

    if (error) throw error;
  },

  async unfollow(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  },
};

// ============================================
// MATCH-UP PICKS
// ============================================

export const matchUpPicks = {
  async savePick(
    userId: string,
    postId: string,
    roundIndex: number,
    winnerName: string,
    loserName: string,
    winnerSide: 'A' | 'B'
  ) {
    const { error } = await supabase
      .from('match_up_picks')
      .upsert([{
        user_id: userId,
        post_id: postId,
        round_index: roundIndex,
        winner_name: winnerName,
        loser_name: loserName,
        winner_side: winnerSide,
      }], {
        onConflict: 'user_id,post_id,round_index',
      });

    if (error) throw error;
  },

  async getUserPicks(userId: string, postId: string) {
    const { data, error } = await supabase
      .from('match_up_picks')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .order('round_index', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!author_id(name, profile_image_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const commentLikes = await supabase
    .from('comment_likes')
    .select('comment_id, user_id')
    .in('comment_id', data.map((c) => c.id));

  const likesMap = new Map<string, Set<string>>();
  commentLikes.data?.forEach((like) => {
    if (!likesMap.has(like.comment_id)) {
      likesMap.set(like.comment_id, new Set());
    }
    likesMap.get(like.comment_id)!.add(like.user_id);
  });

  const commentsMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  data.forEach((dbComment) => {
    const comment: Comment = {
      id: dbComment.id,
      author: {
        name: dbComment.author.name,
        profileImageUrl: dbComment.author.profile_image_url || '',
      },
      text: dbComment.text,
      likes: likesMap.get(dbComment.id) || new Set(),
      replies: [],
      parentId: dbComment.parent_id,
    };

    commentsMap.set(comment.id, comment);

    if (!dbComment.parent_id) {
      rootComments.push(comment);
    }
  });

  commentsMap.forEach((comment) => {
    if (comment.parentId) {
      const parent = commentsMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(comment);
      }
    }
  });

  return rootComments;
}

async function getUserVoteForPost(userId: string, postId: string): Promise<'A' | 'B' | null> {
  const { data, error } = await supabase
    .from('votes')
    .select('option')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (error || !data) return null;
  return data.option as 'A' | 'B';
}

async function getVoteCountsForPost(postId: string): Promise<{ optionAVotes: number; optionBVotes: number }> {
  const { data, error } = await supabase
    .from('votes')
    .select('option')
    .eq('post_id', postId);

  if (error || !data) return { optionAVotes: 0, optionBVotes: 0 };

  const optionAVotes = data.filter(v => v.option === 'A').length;
  const optionBVotes = data.filter(v => v.option === 'B').length;

  return { optionAVotes, optionBVotes };
}

function transformDatabasePostToVsPost(
  dbPost: any,
  comments: Comment[],
  userVote: 'A' | 'B' | null,
  voteCounts: { optionAVotes: number; optionBVotes: number }
): VsPost {
  const post: VsPost = {
    id: dbPost.id,
    type: dbPost.type,
    title: dbPost.title,
    topic: dbPost.topic,
    author: {
      id: dbPost.author.id,
      name: dbPost.author.name,
      profileImageUrl: dbPost.author.profile_image_url || '',
    },
    comments,
    userVote,
    likes: dbPost.likes,
    shares: dbPost.shares,
    aspectRatio: dbPost.aspect_ratio,
    optionA: {
      name: dbPost.option_a_name,
      imageUrl: dbPost.option_a_image,
      votes: voteCounts.optionAVotes,
      backgroundColor: dbPost.option_a_background_color,
      imageTransform: dbPost.option_a_transform,
    },
    optionB: {
      name: dbPost.option_b_name,
      imageUrl: dbPost.option_b_image,
      votes: voteCounts.optionBVotes,
      backgroundColor: dbPost.option_b_background_color,
      imageTransform: dbPost.option_b_transform,
    },
  };

  if (dbPost.type === 'match-up') {
    post.challengers = dbPost.challengers;
    post.initialChallengers = dbPost.initial_challengers;
    post.eliminated = dbPost.eliminated;
    post.champion = dbPost.champion;
    post.roundResults = dbPost.round_results;
  }

  return post;
}

export default {
  auth,
  profiles,
  posts,
  votes,
  comments,
  savedPosts,
  follows,
  matchUpPicks,
};
