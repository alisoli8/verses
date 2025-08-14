
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { INITIAL_POSTS, MOCK_USERS } from './constants';
import { generateNewVsPost, generateImage } from './services/geminiService';
import { RiShare2Line, RiLink } from 'react-icons/ri';
import CommentSheet from './components/common/CommentSheet';
import UserListSheet from './components/common/UserListSheet';


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
          text: `Who will win? Cast your vote for "${post.title}" on AI VS Arena!`,
          url: window.location.href,
        });
        onClose();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Web Share API is not supported in your browser.');
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
  const [posts, setPosts] = useState<VsPost[]>(INITIAL_POSTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('currentUserId'));
  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);

  const [currentView, setCurrentView] = useState<View>(View.FEED);
  const [previousView, setPreviousView] = useState<View>(View.FEED);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [sharePost, setSharePost] = useState<VsPost | null>(null);
  
  const [userListSheetState, setUserListSheetState] = useState<{
    isOpen: boolean;
    title: string;
    userIds: Set<string>;
  }>({ isOpen: false, title: '', userIds: new Set() });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleLogin = useCallback((email: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || MOCK_USERS.find(u => u.id === 'user-123');
    if (user) {
      localStorage.setItem('currentUserId', user.id);
      setCurrentUserId(user.id);
    } else {
      alert("Login failed: User not found.");
    }
  }, [users]);
  
  const handleSignup = useCallback((name: string, email: string) => {
    const newUser: User = {
      id: `user-${new Date().getTime()}`,
      name,
      email,
      profileImageUrl: `https://i.pravatar.cc/150?u=${name}`,
      bio: 'New user ready for battle!',
      avatarInitial: name.charAt(0).toUpperCase(),
      savedPostIds: new Set(),
      following: new Set(),
      followers: new Set(),
    };
    setUsers(prev => [...prev, newUser]);
    localStorage.setItem('currentUserId', newUser.id);
    setCurrentUserId(newUser.id);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('currentUserId');
    setCurrentUserId(null);
    setCurrentView(View.FEED);
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

  const handleClassicVote = useCallback((postId: string, option: 'A' | 'B') => {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId && p.userVote === null) {
          const newPost = { ...p, userVote: option };
          if (option === 'A' && newPost.optionA) {
            newPost.optionA = { ...newPost.optionA, votes: newPost.optionA.votes + 1 };
          } else if (newPost.optionB) {
            newPost.optionB = { ...newPost.optionB, votes: newPost.optionB.votes + 1 };
          }
          return newPost;
        }
        return p;
      })
    );
  }, []);

  const handleToggleSave = useCallback((postId: string) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === currentUserId) {
        const newSavedPostIds = new Set(user.savedPostIds);
        if (newSavedPostIds.has(postId)) { newSavedPostIds.delete(postId); } 
        else { newSavedPostIds.add(postId); }
        return { ...user, savedPostIds: newSavedPostIds };
      }
      return user;
    }));
  }, [currentUserId]);

  const handleSharePost = useCallback((postId: string) => {
    const postToShare = posts.find(p => p.id === postId);
    if(postToShare) {
        setSharePost(postToShare);
    }
  }, [posts]);

  const handleCloseShareModal = () => {
    setSharePost(null);
  }

  const handleAddComment = useCallback((postId: string, text: string, parentId?: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c-${new Date().getTime()}`,
      author: { name: currentUser.name, profileImageUrl: currentUser.profileImageUrl },
      text: text,
      likes: new Set(),
      replies: [],
      parentId: parentId || undefined,
    };

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id !== postId) return p;

        if (!parentId) {
          return { ...p, comments: [newComment, ...p.comments] };
        }

        const addReplyRecursively = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === parentId) {
              return { ...comment, replies: [newComment, ...(comment.replies || [])] };
            }
            if (comment.replies && comment.replies.length > 0) {
              return { ...comment, replies: addReplyRecursively(comment.replies) };
            }
            return comment;
          });
        };
        return { ...p, comments: addReplyRecursively(p.comments) };
      })
    );
  }, [currentUser]);
  
  const handleToggleCommentLike = useCallback((postId: string, commentId: string) => {
    if (!currentUser) return;

    const toggleLikeRecursively = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
            if (comment.id === commentId) {
                const newLikes = new Set(comment.likes);
                if (newLikes.has(currentUser.id)) {
                    newLikes.delete(currentUser.id);
                } else {
                    newLikes.add(currentUser.id);
                }
                return { ...comment, likes: newLikes };
            }
            if (comment.replies && comment.replies.length > 0) {
                return { ...comment, replies: toggleLikeRecursively(comment.replies) };
            }
            return comment;
        });
    };

    setPosts(prevPosts =>
        prevPosts.map(p => {
            if (p.id !== postId) return p;
            return { ...p, comments: toggleLikeRecursively(p.comments) };
        })
    );
  }, [currentUser]);

  const handleCreateAIPost = useCallback(async (topic: string) => {
    if (!currentUser) return;
    try {
        const newPostData = await generateNewVsPost(topic);
        const newPost: VsPost = {
            ...newPostData,
            id: new Date().getTime().toString(),
            type: 'classic',
            userVote: null,
            author: { id: currentUser.id, name: currentUser.name, profileImageUrl: currentUser.profileImageUrl },
            comments: [],
            likes: 0,
            shares: 0,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setCurrentView(View.FEED);
    } catch (error) {
        console.error("Failed to create post:", error);
        throw error;
    }
  }, [currentUser]);
  
  const handleCreateClassicPost = useCallback((postData: Omit<VsPost, 'id' | 'userVote' | 'author' | 'comments' | 'topic' | 'type'>) => {
     if (!currentUser) return;
     const newPost: VsPost = {
        ...postData,
        id: new Date().getTime().toString(),
        type: 'classic',
        topic: 'Custom',
        userVote: null,
        author: { id: currentUser.id, name: currentUser.name, profileImageUrl: currentUser.profileImageUrl },
        comments: [],
     };
     setPosts(prevPosts => [newPost, ...prevPosts]);
     setCurrentView(View.FEED);
  }, [currentUser]);

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

  const handleUpdateUser = useCallback((updatedUser: Partial<User>) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === currentUserId ? {...u, ...updatedUser} : u));
    alert("Profile updated successfully!");
    setCurrentView(View.PROFILE);
  }, [currentUserId]);
  
  const handleFollowToggle = useCallback((targetUserId: string) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === currentUserId) {
          const newFollowing = new Set(user.following);
          if (newFollowing.has(targetUserId)) {
            newFollowing.delete(targetUserId);
          } else {
            newFollowing.add(targetUserId);
          }
          return { ...user, following: newFollowing };
        }
        if (user.id === targetUserId) {
          const newFollowers = new Set(user.followers);
          if (newFollowers.has(currentUserId!)) {
            newFollowers.delete(currentUserId!);
          } else {
            newFollowers.add(currentUserId!);
          }
          return { ...user, followers: newFollowers };
        }
        return user;
      });
    });
  }, [currentUserId]);

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
  
  if (!currentUser) {
    return <AuthView onLogin={handleLogin} onSignup={handleSignup} />;
  }
  
  const renderContent = () => {
    switch (currentView) {
      case View.CREATE:
        return <CreateView posts={posts} onBack={() => setCurrentView(View.FEED)} onCreateWithAI={handleCreateAIPost} onCreateClassic={handleCreateClassicPost} onCreateMatchUp={handleCreateMatchUpPost} />;
      case View.SEARCH:
        return <SearchView
                    posts={posts}
                    user={currentUser}
                    onSelectPost={handleSelectPost}
                    onToggleSave={handleToggleSave}
                    onClassicVote={handleClassicVote}
                    onSharePost={handleSharePost}
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
        return <FeedView user={currentUser} onSelectPost={handleSelectPost} onToggleSave={handleToggleSave} posts={posts} showHighlights={true} emptyStateMessage="Welcome! Create a post to get started." onClassicVote={handleClassicVote} onMatchUpVote={handleMatchUpVote} onSharePost={handleSharePost} onCommentClick={handleOpenComments} onFollow={handleFollowToggle} />;
    }
  };

  const showNavBar = ![View.VOTING, View.CREATE, View.SETTINGS].includes(currentView);

  return (
    <div className="bg-brand-off-white dark:bg-black text-gray-800 dark:text-gray-100 min-h-screen antialiased flex flex-col">
       <main className={`flex-grow p-1 ${showNavBar ? 'pb-20' : ''}`}>{renderContent()}</main>
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
