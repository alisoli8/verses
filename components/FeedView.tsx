
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { VsPost, User, VsOption } from '../types';
import PostCard from './PostCard';
import HighlightsView from './HighlightsView';

interface FeedViewProps {
  posts: VsPost[];
  user: User | null;
  onSelectPost: (id: string, showComments?: boolean) => void;
  onToggleSave: (id: string) => void;
  onClassicVote: (id: string, option: 'A' | 'B') => void;
  onMatchUpVote: (postId: string, winner: VsOption, loser: VsOption, winnerSide: 'A' | 'B') => void;
  onSharePost: (id: string) => void;
  onCommentClick: (postId: string) => void;
  onFollow: (authorId: string) => void;
  onEditPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onReportDuplicate?: (postId: string) => void;
  onHidePost?: (postId: string) => void;
  title?: string;
  emptyStateMessage: string;
  showHighlights?: boolean;
}

const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick} 
      className={`flex-1 py-2.5 px-2 text-sm font-bold text-center rounded-full transition-all duration-300 focus:outline-none relative z-10 ${
        isActive 
          ? 'text-brand-lime dark:text-black' 
          : 'text-gray-600 dark:text-gray-300'
      }`}
    >
        {label}
    </button>
);

const FeedView: React.FC<FeedViewProps> = ({ 
  posts, 
  user, 
  onSelectPost, 
  onToggleSave, 
  onClassicVote, 
  onMatchUpVote, 
  onSharePost, 
  onCommentClick, 
  onFollow,
  onEditPost,
  onDeletePost,
  onReportDuplicate,
  onHidePost,
  title, 
  emptyStateMessage, 
  showHighlights = false 
}) => {
  const [activeTab, setActiveTab] = useState<'for_you' | 'following' | 'match_up'>('for_you');
  const [showTabs, setShowTabs] = useState(true);
  const lastScrollY = useRef(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const latestPosts = showHighlights ? posts.slice(0, 44) : [];

  const tabOrder: Array<'for_you' | 'following' | 'match_up'> = ['for_you', 'following', 'match_up'];
  const activeTabIndex = tabOrder.indexOf(activeTab);

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) < minSwipeDistance) return;

    if (swipeDistance > 0) {
      // Swiped left - go to next tab
      const nextIndex = activeTabIndex + 1;
      if (nextIndex < tabOrder.length) {
        setActiveTab(tabOrder[nextIndex]);
      }
    } else {
      // Swiped right - go to previous tab
      const prevIndex = activeTabIndex - 1;
      if (prevIndex >= 0) {
        setActiveTab(tabOrder[prevIndex]);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  useEffect(() => {
    if (!showHighlights) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show tabs when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setShowTabs(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling down (and past 50px to avoid hiding immediately)
        setShowTabs(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showHighlights]);

  const displayedPosts = useMemo(() => {
    if (!showHighlights) return posts;

    if (activeTab === 'following') {
      return posts.filter(p => user?.following.has(p.author.id) || p.author.id === user?.id);
    }
    if (activeTab === 'match_up') {
        return posts.filter(p => p.type === 'match-up');
    }
    return posts;
  }, [activeTab, posts, user, showHighlights]);
  
  const emptyMessages = {
      for_you: emptyStateMessage,
      following: "Posts from people you follow will appear here. Find people to follow in the 'For you' tab!",
      match_up: "No Match Up battles have been created yet. Be the first to create one!"
  };
  const currentEmptyMessage = emptyMessages[activeTab];

  return (
    <div>
      {showHighlights && (
        <div 
          className="sticky top-0 bg-brand-screen-color/80 rounded-b-2xl dark:bg-black/80 backdrop-blur-lg z-50 py-3 transition-transform duration-300 ease-in-out"
          style={{ transform: showTabs ? 'translateY(0)' : 'translateY(-100%)' }}
        >
          <div className="max-w-xl mx-auto px-3">
            <div className="bg-[#f1efe9] dark:bg-gray-800 p-1 rounded-2xl flex items-center space-x-1 relative">
                {/* Animated background indicator */}
                <div 
                  className="absolute top-1 bottom-1 bg-gray-800 dark:bg-gray-200 rounded-2xl transition-all duration-300 ease-out"
                  style={{
                    left: `calc(${activeTabIndex * 33.333}% + 4px)`,
                    width: 'calc(33.333% - 8px)'
                  }}
                />
                <TabButton label="For you" isActive={activeTab === 'for_you'} onClick={() => setActiveTab('for_you')} />
                <TabButton label="Following" isActive={activeTab === 'following'} onClick={() => setActiveTab('following')} />
                <TabButton label="Match ups" isActive={activeTab === 'match_up'} onClick={() => setActiveTab('match_up')} />
            </div>
          </div>
        </div>
      )}

      <div 
        ref={contentRef}
        className="max-w-xl mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {showHighlights && activeTab === 'for_you' && (
          <div 
            className="pt-4 px-2"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-zinc-800 dark:text-gray-300 mb-2 px-1">Latest</p>
            <HighlightsView posts={latestPosts} onSelectPost={onSelectPost} />
          </div>
        )}
        
        {title && <h1 className={`text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-4 ${showHighlights ? 'mt-8' : ''}`}>{title}</h1>}
        
        {displayedPosts.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p className="text-gray-500 dark:text-gray-400">{currentEmptyMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 sm:space-y-6 px-2 py-4">
            {displayedPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post}
                isSaved={user?.savedPostIds.has(post.id) ?? false}
                currentUser={user!}
                isFollowing={user?.following.has(post.author.id) ?? false}
                onVote={onClassicVote}
                onMatchUpVote={onMatchUpVote}
                onToggleSave={onToggleSave}
                onShare={onSharePost}
                onFollow={onFollow}
                onCommentClick={() => onCommentClick(post.id)}
                onTitleClick={() => onSelectPost(post.id)}
                onVotedCardClick={() => onSelectPost(post.id, true)}
                onEdit={onEditPost}
                onDelete={onDeletePost}
                onReportDuplicate={onReportDuplicate}
                onHide={onHidePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedView;
