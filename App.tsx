
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import FeedView from './components/FeedView';
import CreateView from './components/CreateView';
import VotingView from './components/VotingView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import SavedView from './components/Header';
import SearchView from './components/SearchView';
import BottomNavBar from './components/BottomNavBar';
import AuthView from './components/auth/AuthView';
import { View } from './types';
import type { VsPost, User, Comment, VsOption } from './types';
import { generateNewVsPost, generateImage } from './services/geminiService';
import { RiShare2Line, RiLink } from 'react-icons/ri';
import CommentSheet from './components/common/CommentSheet';
import UserListSheet from './components/common/UserListSheet';
import supabaseService from './services/supabaseService';
import { toast } from './contexts/ToastContext';


const AppShareModal: React.FC<{ post: VsPost, onClose: () => void }> = ({ post, onClose }) => {
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    setIsLinkCopied(false);
  }, [post]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vote now: ${post.title}`,
          text: `Who will win? Cast your vote for "${post.title}" on Verses!`,
          url: window.location.href,
        });
        onClose();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast.warning('Web Share API is not supported in your browser.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsLinkCopied(true);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-800 rounded-t-2xl w-full max-w-md p-4 text-white animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-bold text-center mb-4">Share this post</h3>
        <div className="space-y-2">
          <button onClick={handleNativeShare} className="w-full flex items-center gap-4 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <RiShare2Line className="w-6 h-6 text-gray-300" />
            <span className="font-semibold">Share via...</span>
          </button>
          <button onClick={handleCopyLink} className="w-full flex items-center gap-4 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <RiLink className="w-6 h-6 text-gray-300" />
            <span className="font-semibold">{isLinkCopied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [posts, setPosts] = useState<VsPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [currentView, setCurrentView] = useState<View>(View.FEED);
  const [previousView, setPreviousView] = useState<View>(View.FEED);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [sharePost, setSharePost] = useState<VsPost | null>(null);
  const [editingPost, setEditingPost] = useState<VsPost | null>(null);
  
  const [userListSheetState, setUserListSheetState] = useState<{
    isOpen: boolean;
    title: string;
    userIds: Set<string>;
  }>({ isOpen: false, title: '', userIds: new Set() });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Prevent duplicate auth initialization during HMR hot reloads
  const authInitializedRef = useRef(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Skip if already initialized (prevents HMR duplicate calls)
    if (authInitializedRef.current) {
      console.log('⏭️ Auth already initialized, skipping...');
      return;
    }
    
    authInitializedRef.current = true;
    
    const initializeAuth = async () => {
      console.log('🔵 Initializing auth...');
      
      try {
        const session = await supabaseService.auth.getSession();
        console.log('Session:', session?.user ? 'User logged in' : 'No user');
        
        if (session?.user) {
          console.log('🔵 Fetching profile for user:', session.user.id);
          const profile = await supabaseService.profiles.getProfile(session.user.id);
          
          if (profile) {
            console.log('✅ Profile found:', profile.name);
            setCurrentUser(profile);
          } else {
            console.warn('⚠️ Auth user exists but no profile found. Logging out...');
            await supabaseService.auth.signOut();
          }
        }
      } catch (error) {
        console.error('🔴 Auth initialization error:', error);
        await supabaseService.auth.signOut();
      } finally {
        console.log('✅ Auth check complete');
        setAuthChecked(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabaseService.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 Auth state changed:', event);
      
      // Only handle LOGIN and SIGNOUT events
      // SIGNUP is handled directly in handleSignup
      if (event === 'SIGNED_IN' && session?.user) {
        // Get current user from state to avoid stale closure
        setCurrentUser(prev => {
          // If user already loaded from signup, skip
          if (prev?.id === session.user.id) {
            console.log('ℹ️ User already loaded from signup, skipping fetch');
            return prev;
          }
          
          // Otherwise fetch profile for login
          console.log('🔵 User signed in via login, fetching profile...');
          supabaseService.profiles.getProfile(session.user.id).then(profile => {
            if (profile) {
              console.log('✅ Profile loaded:', profile.name);
              setCurrentUser(profile);
            } else {
              console.warn('⚠️ No profile found after signin');
              supabaseService.auth.signOut();
            }
          });
          
          return prev; // Keep previous user while loading
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!authChecked) return;
      
      try {
        setLoading(true);
        const [postsData, usersData] = await Promise.all([
          supabaseService.posts.getAllPosts(),
          supabaseService.profiles.getAllProfiles(),
        ]);
        setPosts(postsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authChecked]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleLogin = useCallback(async (email: string, password: string = 'password123') => {
    try {
      await supabaseService.auth.signIn(email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(`Login failed: ${error.message}`);
    }
  }, []);
  
  const handleSignup = useCallback(async (name: string, email: string, password: string = 'password123') => {
    console.log('🔵 Signup initiated for:', email);
    try {
      // signUp now waits for complete profile creation
      const { profile } = await supabaseService.auth.signUp(email, password, name);
      console.log('✅ Signup completed successfully, profile ready');
      
      // Directly set the user - profile is already fully loaded
      setCurrentUser(profile);
      
      // Auth is now complete, fetch data will run automatically
    } catch (error: any) {
      console.error('🔴 Signup error:', error);
      toast.error(`Signup failed: ${error.message || 'Unknown error'}`);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await supabaseService.auth.signOut();
      setCurrentView(View.FEED);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);


  const handleNavigate = (view: View) => {
    if ([View.FEED, View.PROFILE, View.SAVED, View.SEARCH].includes(currentView)) {
        setPreviousView(currentView);
    }
    setCurrentView(view);
  }
  
  const handleSelectPost = (id: string, showComments: boolean = false) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    if ([View.FEED, View.PROFILE, View.SAVED, View.SEARCH].includes(currentView)) {
        setPreviousView(currentView);
    }

    if (post.type === 'match-up') {
        handleOpenComments(id);
    } else if (post.type === 'classic') {
        if (showComments) {
            handleOpenComments(id);
        } else {
            setSelectedPostId(id);
            setCurrentView(View.VOTING);
        }
    }
  };
  
  const handleOpenComments = useCallback((postId: string) => {
    setCommentingPostId(postId);
  }, []);

  const handleCloseComments = useCallback(() => {
    setCommentingPostId(null);
  }, []);

  const handleBackFromSubView = () => { 
    setCurrentView(previousView); 
    setSelectedPostId(null); 
  };
  
  const handleBackFromSettings = () => setCurrentView(View.PROFILE);

  const handleClassicVote = useCallback(async (postId: string, option: 'A' | 'B') => {
    if (!currentUser) return;
    
    try {
      await supabaseService.votes.vote(currentUser.id, postId, option);
      
      const updatedPost = await supabaseService.posts.getPost(postId);
      if (updatedPost) {
        setPosts(prevPosts => prevPosts.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  }, [currentUser]);

  const handleToggleSave = useCallback(async (postId: string) => {
    if (!currentUser) return;
    
    try {
      const isSaved = currentUser.savedPostIds.has(postId);
      
      // Optimistically update local state immediately
      const updatedSavedPostIds = new Set(currentUser.savedPostIds);
      if (isSaved) {
        updatedSavedPostIds.delete(postId);
        await supabaseService.savedPosts.unsavePost(currentUser.id, postId);
      } else {
        updatedSavedPostIds.add(postId);
        await supabaseService.savedPosts.savePost(currentUser.id, postId);
      }
      
      // Update only the savedPostIds field without refetching entire profile
      setCurrentUser(prev => prev ? { ...prev, savedPostIds: updatedSavedPostIds } : null);
    } catch (error) {
      console.error('Toggle save error:', error);
    }
  }, [currentUser]);

  const handleSharePost = useCallback((postId: string) => {
    const postToShare = posts.find(p => p.id === postId);
    if(postToShare) {
        setSharePost(postToShare);
    }
  }, [posts]);

  const handleCloseShareModal = () => {
    setSharePost(null);
  }

  const handleAddComment = useCallback(async (postId: string, text: string, parentId?: string) => {
    if (!currentUser) return;
    
    try {
      await supabaseService.comments.addComment(postId, currentUser.id, text, parentId);
      
      const updatedPost = await supabaseService.posts.getPost(postId);
      if (updatedPost) {
        setPosts(prevPosts => prevPosts.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (error) {
      console.error('Add comment error:', error);
    }
  }, [currentUser]);
  
  const handleToggleCommentLike = useCallback(async (postId: string, commentId: string) => {
    if (!currentUser) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const findComment = (comments: Comment[]): Comment | null => {
        for (const comment of comments) {
          if (comment.id === commentId) return comment;
          const found = findComment(comment.replies);
          if (found) return found;
        }
        return null;
      };
      
      const comment = findComment(post.comments);
      if (!comment) return;
      
      const isLiked = comment.likes.has(currentUser.id);
      
      if (isLiked) {
        await supabaseService.comments.unlikeComment(currentUser.id, commentId);
      } else {
        await supabaseService.comments.likeComment(currentUser.id, commentId);
      }
      
      const updatedPost = await supabaseService.posts.getPost(postId);
      if (updatedPost) {
        setPosts(prevPosts => prevPosts.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (error) {
      console.error('Toggle comment like error:', error);
    }
  }, [currentUser, posts]);

  const handleCreateAIPost = useCallback(async (topic: string) => {
    if (!currentUser) return;
    try {
        const newPostData = await generateNewVsPost(topic);
        
        const createdPost = await supabaseService.posts.createPost(currentUser.id, {
            type: 'classic',
            title: newPostData.title,
            topic: topic,
            option_a_name: newPostData.optionA!.name,
            option_a_image: newPostData.optionA!.imageUrl,
            option_a_votes: 0,
            option_b_name: newPostData.optionB!.name,
            option_b_image: newPostData.optionB!.imageUrl,
            option_b_votes: 0,
            likes: 0,
            shares: 0,
        });
        
        setPosts(prevPosts => [createdPost, ...prevPosts]);
        setCurrentView(View.FEED);
    } catch (error) {
        console.error("Failed to create post:", error);
        throw error;
    }
  }, [currentUser]);
  
  const handleCreateClassicPost = useCallback(async (postData: Omit<VsPost, 'id' | 'userVote' | 'author' | 'comments' | 'topic' | 'type'>) => {
     if (!currentUser || !postData.optionA || !postData.optionB) return;
     
     try {
       // Check if we're editing an existing post
       if (editingPost) {
         // Update existing post
         await supabaseService.posts.updatePost(editingPost.id, {
           title: postData.title,
           option_a_name: postData.optionA.name,
           option_a_image: postData.optionA.imageUrl,
           option_a_background_color: postData.optionA.backgroundColor,
           option_a_transform: postData.optionA.imageTransform,
           option_b_name: postData.optionB.name,
           option_b_image: postData.optionB.imageUrl,
           option_b_background_color: postData.optionB.backgroundColor,
           option_b_transform: postData.optionB.imageTransform,
           aspect_ratio: postData.aspectRatio,
         });
         
         // Update local state
         setPosts(prevPosts => prevPosts.map(p => 
           p.id === editingPost.id 
             ? { 
                 ...p, 
                 title: postData.title,
                 aspectRatio: postData.aspectRatio,
                 optionA: postData.optionA,
                 optionB: postData.optionB
               }
             : p
         ));
         setEditingPost(null);
         toast.success('Post updated successfully!');
       } else {
         // Create new post
         const createdPost = await supabaseService.posts.createPost(currentUser.id, {
           type: 'classic',
           title: postData.title,
           topic: 'Custom',
           option_a_name: postData.optionA.name,
           option_a_image: postData.optionA.imageUrl,
           option_a_votes: 0,
           option_a_background_color: postData.optionA.backgroundColor,
           option_a_transform: postData.optionA.imageTransform,
           option_b_name: postData.optionB.name,
           option_b_image: postData.optionB.imageUrl,
           option_b_votes: 0,
           option_b_background_color: postData.optionB.backgroundColor,
           option_b_transform: postData.optionB.imageTransform,
           likes: postData.likes || 0,
           shares: postData.shares || 0,
           aspect_ratio: postData.aspectRatio,
         });
         
         setPosts(prevPosts => [createdPost, ...prevPosts]);
       }
       
       setCurrentView(View.FEED);
     } catch (error) {
       console.error('Create/update post error:', error);
       toast.error('Failed to save post');
     }
  }, [currentUser, editingPost]);

  const handleCreateMatchUpPost = useCallback(async (title: string, challengers: string[]) => {
    if (!currentUser) return;

    const imagePromises = challengers.map(name => generateImage(name, title));
    const imageUrls = await Promise.all(imagePromises);
    
    const contenders = challengers.map((name, index) => ({
      name,
      imageUrl: imageUrls[index]
    }));

    const shuffled = [...contenders].sort(() => 0.5 - Math.random());
    const first = shuffled.pop()!;
    const second = shuffled.pop()!;

    const newPost: VsPost = {
      id: new Date().getTime().toString(),
      type: 'match-up',
      title,
      topic: title,
      author: { id: currentUser.id, name: currentUser.name, profileImageUrl: currentUser.profileImageUrl },
      comments: [],
      userVote: null,
      likes: 0,
      shares: 0,
      challengers: shuffled,
      initialChallengers: contenders,
      eliminated: [],
      roundResults: [],
      userPicks: [],
      currentRoundVoted: false,
      userChampionSide: null,
      optionA: { name: first.name, imageUrl: first.imageUrl, votes: 0 },
      optionB: { name: second.name, imageUrl: second.imageUrl, votes: 0 }
    };
    setPosts(prev => [newPost, ...prev]);
    setCurrentView(View.FEED);
  }, [currentUser]);

  const handleMatchUpVote = useCallback((postId: string, winner: VsOption, loser: VsOption, winnerSide: 'A' | 'B') => {
    // Part 1: Show round result immediately
    setPosts(prev => prev.map(p => {
        if (p.id !== postId || p.type !== 'match-up' || p.currentRoundVoted) return p;

        const updatedPost = { ...p };

        // Set votes for this round display
        if (winnerSide === 'A' && updatedPost.optionA && updatedPost.optionB) {
            updatedPost.optionA = { ...updatedPost.optionA, votes: 1 };
            updatedPost.optionB = { ...updatedPost.optionB, votes: 0 };
        } else if (updatedPost.optionB && updatedPost.optionA) {
            updatedPost.optionB = { ...updatedPost.optionB, votes: 1 };
            updatedPost.optionA = { ...updatedPost.optionA, votes: 0 };
        }
        
        // Track user pick and which side they are championing
        updatedPost.userPicks = Array.from(new Set([...(p.userPicks || []), winner.name]));
        updatedPost.userChampionSide = winnerSide;
        updatedPost.currentRoundVoted = true;

        return updatedPost;
    }));

    // Part 2: Advance after a delay
    setTimeout(() => {
        setPosts(prev => prev.map(p => {
            if (p.id !== postId || p.type !== 'match-up' || !p.currentRoundVoted) return p;
            
            if (!p.optionA || !p.optionB) return p;
            
            const updatedPost = { ...p };
            
            // The winner is the one on the side the user just clicked
            const winnerOfRound = updatedPost.userChampionSide === 'A' ? p.optionA : p.optionB;
            const loserOfRound = updatedPost.userChampionSide === 'A' ? p.optionB : p.optionA;

            const roundResult = { contenderA: p.optionA, contenderB: p.optionB };
            updatedPost.roundResults = [...(p.roundResults || []), roundResult];
            updatedPost.eliminated = [...(p.eliminated || []), loserOfRound.name];
            
            const remainingChallengers = [...(p.challengers || [])];

            if (remainingChallengers.length > 0) {
                const nextChallengerData = remainingChallengers.pop()!;
                const nextChallenger: VsOption = { name: nextChallengerData.name, imageUrl: nextChallengerData.imageUrl, votes: 0 };
                const winnerOption: VsOption = { ...winnerOfRound, votes: 0 };
                
                updatedPost.challengers = remainingChallengers;

                // IMPORTANT: Keep winner on the same side
                if(updatedPost.userChampionSide === 'A') {
                    updatedPost.optionA = winnerOption;
                    updatedPost.optionB = nextChallenger;
                } else {
                    updatedPost.optionA = nextChallenger;
                    updatedPost.optionB = winnerOption;
                }
                
                updatedPost.currentRoundVoted = false;
            } else {
                updatedPost.champion = winnerOfRound;
                updatedPost.optionA = undefined;
                updatedPost.optionB = undefined;
                updatedPost.challengers = [];
                updatedPost.currentRoundVoted = false;
            }

            return updatedPost;
        }));
    }, 1500);
  }, []);

  const handleUpdateUser = useCallback(async (updatedUser: Partial<User>) => {
    if (!currentUser) return;
    
    try {
      await supabaseService.profiles.updateProfile(currentUser.id, {
        name: updatedUser.name,
        bio: updatedUser.bio,
        profile_image_url: updatedUser.profileImageUrl,
        avatar_initial: updatedUser.avatarInitial,
      });
      
      const updatedProfile = await supabaseService.profiles.getProfile(currentUser.id);
      if (updatedProfile) {
        setCurrentUser(updatedProfile);
      }
      
      toast.success('Profile updated successfully!');
      setCurrentView(View.PROFILE);
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update profile');
    }
  }, [currentUser]);
  
  const handleFollowToggle = useCallback(async (targetUserId: string) => {
    if (!currentUser) return;
    
    try {
      const isFollowing = currentUser.following.has(targetUserId);
      
      // Optimistically update local state immediately
      const updatedFollowing = new Set(currentUser.following);
      if (isFollowing) {
        updatedFollowing.delete(targetUserId);
        await supabaseService.follows.unfollow(currentUser.id, targetUserId);
      } else {
        updatedFollowing.add(targetUserId);
        await supabaseService.follows.follow(currentUser.id, targetUserId);
      }
      
      // Update only the following field without refetching entire profile
      setCurrentUser(prev => prev ? { ...prev, following: updatedFollowing } : null);
      
      // Update the target user's follower count in the users list
      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === targetUserId) {
          const updatedFollowers = new Set(user.followers);
          if (isFollowing) {
            updatedFollowers.delete(currentUser.id);
          } else {
            updatedFollowers.add(currentUser.id);
          }
          return { ...user, followers: updatedFollowers };
        }
        return user;
      }));
    } catch (error) {
      console.error('Follow toggle error:', error);
    }
  }, [currentUser]);

  const handleEditPost = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Check if post has votes
    const totalVotes = (post.optionA?.votes ?? 0) + (post.optionB?.votes ?? 0);
    if (totalVotes > 0) {
      toast.warning('Cannot edit a post that has votes');
      return;
    }
    
    setEditingPost(post);
    setCurrentView(View.CREATE);
  }, [posts]);

  const handleDeletePost = useCallback(async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await supabaseService.posts.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
    }
  }, []);

  const handleReportDuplicate = useCallback((postId: string) => {
    toast.info(`Reported post as duplicate - This would be sent to moderators in a real implementation`);
  }, []);

  const handleHidePost = useCallback((postId: string) => {
    // In a real app, this would hide the post from the user's feed
    toast.info('Post hidden from your feed');
  }, []);

  const handleShowUserList = useCallback((listType: 'followers' | 'following', userIds: Set<string>) => {
      setUserListSheetState({
          isOpen: true,
          title: listType.charAt(0).toUpperCase() + listType.slice(1),
          userIds
      });
  }, []);

  const handleCloseUserList = () => {
      setUserListSheetState({ isOpen: false, title: '', userIds: new Set() });
  }

  const userListSheetUsers = useMemo(() => {
    return users.filter(user => userListSheetState.userIds.has(user.id));
  }, [users, userListSheetState.userIds]);

  const selectedPost = useMemo(() => {
    if (currentView !== View.VOTING || !selectedPostId) return undefined;
    const post = posts.find(p => p.id === selectedPostId);
    return post?.type === 'classic' ? post : undefined;
  }, [currentView, selectedPostId, posts]);

  const commentingPost = useMemo(() => {
    return posts.find(p => p.id === commentingPostId) || null;
  }, [posts, commentingPostId]);

  const myPosts = useMemo(() => posts.filter(p => p.author.id === currentUser?.id).sort((a,b) => b.id.localeCompare(a.id)), [posts, currentUser?.id]);
  const votedPosts = useMemo(() => {
      const votedClassic = posts.filter(p => p.type === 'classic' && p.userVote !== null);
      const votedMatchUp = posts.filter(p => p.type === 'match-up' && (p.userPicks?.length ?? 0 > 0));
      return [...votedClassic, ...votedMatchUp].sort((a,b) => b.id.localeCompare(a.id));
  }, [posts]);
  
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-brand-screen-color dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-lime"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-screen-color dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-lime"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <AuthView onLogin={handleLogin} onSignup={handleSignup} />;
  }
  
  const renderContent = () => {
    switch (currentView) {
      case View.CREATE:
        return <CreateView 
          posts={posts} 
          editPost={editingPost}
          onBack={() => {
            setEditingPost(null);
            setCurrentView(View.FEED);
          }} 
          onCreateWithAI={handleCreateAIPost} 
          onCreateClassic={handleCreateClassicPost} 
          onCreateMatchUp={handleCreateMatchUpPost} 
        />;
      case View.SEARCH:
        return <SearchView
                    posts={posts}
                    user={currentUser}
                    onSelectPost={handleSelectPost}
                    onToggleSave={handleToggleSave}
                    onClassicVote={handleClassicVote}
                    onSharePost={handleSharePost}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    onReportDuplicate={handleReportDuplicate}
                    onHidePost={handleHidePost}
                />;
      case View.SAVED:
        return <SavedView
                    posts={posts}
                    user={currentUser}
                    onSelectPost={handleSelectPost}
                    onToggleSave={handleToggleSave}
                    onClassicVote={handleClassicVote}
                    onMatchUpVote={handleMatchUpVote}
                    onSharePost={handleSharePost}
                    onCommentClick={handleOpenComments}
                    onFollow={handleFollowToggle}
                />;
      case View.VOTING:
        return <VotingView 
                    post={selectedPost!} 
                    user={currentUser}
                    onBack={handleBackFromSubView} 
                    onClassicVote={handleClassicVote} 
                    onToggleSave={handleToggleSave}
                    onOpenComments={handleOpenComments}
                    onSharePost={handleSharePost}
                    onFollow={handleFollowToggle}
                />;
      case View.PROFILE:
        return <ProfileView user={currentUser} allUsers={users} myPosts={myPosts} votedPosts={votedPosts} onNavigate={handleNavigate} onSelectPost={handleSelectPost} onToggleSave={handleToggleSave} onClassicVote={handleClassicVote} onMatchUpVote={handleMatchUpVote} onSharePost={handleSharePost} onCommentClick={handleOpenComments} onShowUserList={handleShowUserList} onFollowToggle={handleFollowToggle} />;
      case View.SETTINGS:
        return <SettingsView user={currentUser} onBack={handleBackFromSettings} onUpdateUser={handleUpdateUser} theme={theme} onToggleTheme={handleToggleTheme} onLogout={handleLogout} />;
      case View.FEED:
      default:
        return <FeedView user={currentUser} onSelectPost={handleSelectPost} onToggleSave={handleToggleSave} posts={posts} showHighlights={true} emptyStateMessage="Welcome! Create a post to get started." onClassicVote={handleClassicVote} onMatchUpVote={handleMatchUpVote} onSharePost={handleSharePost} onCommentClick={handleOpenComments} onFollow={handleFollowToggle} onEditPost={handleEditPost} onDeletePost={handleDeletePost} onReportDuplicate={handleReportDuplicate} onHidePost={handleHidePost} />;
    }
  };

  const showNavBar = ![View.VOTING, View.CREATE, View.SETTINGS].includes(currentView);

  return (
    <div className="bg-[#f1efe9] dark:bg-black text-gray-800 dark:text-gray-100 min-h-screen antialiased flex flex-col">
       <main className={`flex-grow ${showNavBar ? 'pb-20' : ''}`}>{renderContent()}</main>
       {showNavBar && <BottomNavBar currentView={currentView} onNavigate={handleNavigate} />}
       {sharePost && <AppShareModal post={sharePost} onClose={handleCloseShareModal} />}
       <CommentSheet
          isOpen={!!commentingPostId}
          onClose={handleCloseComments}
          post={commentingPost}
          user={currentUser}
          onAddComment={handleAddComment}
          onToggleCommentLike={handleToggleCommentLike}
       />
       <UserListSheet
          isOpen={userListSheetState.isOpen}
          onClose={handleCloseUserList}
          title={userListSheetState.title}
          usersToShow={userListSheetUsers}
          currentUser={currentUser}
          onFollowToggle={handleFollowToggle}
       />
    </div>
  );
};

export default App;
