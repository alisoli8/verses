
import React, { useState, useMemo } from 'react';
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
  title?: string;
  emptyStateMessage: string;
  showHighlights?: boolean;
}

const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick} 
      className={`flex-1 py-2.5 px-2 text-sm font-bold text-center rounded-2xl transition-all duration-300 focus:outline-none ${
        isActive 
          ? 'bg-gray-800 text-brand-lime dark:bg-gray-200 dark:text-black shadow' 
          : 'bg-gray-100 text-black dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
        {label}
    </button>
);

const FeedView: React.FC<FeedViewProps> = ({ posts, user, onSelectPost, onToggleSave, onClassicVote, onMatchUpVote, onSharePost, title, emptyStateMessage, showHighlights = false, onCommentClick, onFollow }) => {
  const [activeTab, setActiveTab] = useState<'for_you' | 'following' | 'match_up'>('for_you');
  const latestPosts = showHighlights ? posts.slice(0, 44) : [];

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
        <div className="sticky top-0 bg-brand-off-white/80 dark:bg-black/80 backdrop-blur-lg z-10 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-xl mx-auto px-4">
            <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-3xl flex items-center space-x-1">
                <TabButton label="For you" isActive={activeTab === 'for_you'} onClick={() => setActiveTab('for_you')} />
                <TabButton label="Following" isActive={activeTab === 'following'} onClick={() => setActiveTab('following')} />
                <TabButton label="Match ups" isActive={activeTab === 'match_up'} onClick={() => setActiveTab('match_up')} />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto">
        {showHighlights && activeTab === 'for_you' && <div className="pt-6 px-2"><HighlightsView posts={latestPosts} onSelectPost={onSelectPost} /></div>}
        
        {title && <h1 className={`text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-4 ${showHighlights ? 'mt-8' : ''}`}>{title}</h1>}
        
        {displayedPosts.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p className="text-gray-500 dark:text-gray-400">{currentEmptyMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 sm:space-y-6 py-4">
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedView;
