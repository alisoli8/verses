import React, { useMemo, useState, useRef } from 'react';
import type { User, VsPost, VsOption } from '../types';
import { View } from '../types';
import { RiSettings4Line } from 'react-icons/ri';
import { PostMasonryGrid } from './SearchView';

interface ProfileViewProps {
  user: User;
  allUsers: User[];
  myPosts: VsPost[];
  votedPosts: VsPost[];
  onNavigate: (view: View) => void;
  onSelectPost: (id: string, showComments?: boolean) => void;
  onToggleSave: (id: string) => void;
  onClassicVote: (id: string, option: 'A' | 'B') => void;
  onMatchUpVote: (postId: string, winner: VsOption, loser: VsOption, winnerSide: 'A' | 'B') => void;
  onSharePost: (id: string) => void;
  onCommentClick: (postId: string) => void;
  onShowUserList: (listType: 'followers' | 'following', userIds: Set<string>) => void;
  onFollowToggle: (authorId: string) => void;
}

const ProfileLinkStat = ({ value, label, onClick }: { value: number; label: string; onClick: () => void }) => (
    <button onClick={onClick} className="transition-colors hover:text-black/70">
        <span className="font-bold">{value}</span>
        <span className="text-black/80 ml-1.5">{label}</span>
    </button>
);

const ProfileMetric = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <p className="text-4xl font-extrabold">{value}</p>
    <p className="text-sm font-medium opacity-80 mt-1">{label}</p>
  </div>
);

const ProfileTabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors duration-200 relative z-10 ${
        isActive
          ? 'text-white dark:text-black'
          : 'text-gray-500 dark:text-gray-400'
      }`}
    >
        {label}
    </button>
);


const ProfileView: React.FC<ProfileViewProps> = ({ user, allUsers, myPosts, votedPosts, onNavigate, onSelectPost, onToggleSave, onClassicVote, onMatchUpVote, onSharePost, onCommentClick, onShowUserList, onFollowToggle }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'voted'>('posts');
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const tabOrder: Array<'posts' | 'voted'> = ['posts', 'voted'];
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

  const stats = useMemo(() => {
    const createdCount = myPosts.length;
    const votedOnCount = votedPosts.length;
    return { createdCount, votedOnCount };
  }, [myPosts, votedPosts]);

  const displayedPosts = activeTab === 'posts' ? myPosts : votedPosts;
  const emptyStateMessage = activeTab === 'posts' 
      ? "You haven't created any posts yet."
      : "You haven't voted on any posts yet.";

  return (
    <div className="min-h-full">
        <div className="max-w-2xl mx-auto">
            {/* START: Profile Header from Image */}
            <div className="bg-brand-lime text-black rounded-b-[3em] pt-12 pb-8 px-5 sm:m-0">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <img 
                            src={user.profileImageUrl} 
                            alt={user.name}
                            className="w-20 h-20 rounded-3xl object-cover bg-gray-500/20 shadow-md"
                        />
                        <div>
                            <h1 className="text-2xl font-bold">@{user.name}</h1>
                            <div className="flex items-center space-x-4 mt-1 text-sm">
                                <ProfileLinkStat value={user.following.size} label="Following" onClick={() => onShowUserList('following', user.following)} />
                                <ProfileLinkStat value={user.followers.size} label="Followers" onClick={() => onShowUserList('followers', user.followers)} />
                            </div>
                        </div>
                    </div>
                    <button onClick={() => onNavigate(View.SETTINGS)} className="p-2 text-black/60 hover:text-black transition-colors">
                        <RiSettings4Line className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex justify-around mt-6 pt-6 border-t border-black/10">
                    <ProfileMetric value={stats.createdCount} label="Created" />
                    <ProfileMetric value={stats.votedOnCount} label="Voted" />
                </div>
            </div>
            {/* END: Profile Header */}
        
            <div className="px-2 sm:px-0 py-4">
                <div className="bg-gray-200/70 dark:bg-gray-800 p-1 rounded-2xl flex items-center space-x-1 my-4 relative">
                    {/* Animated background indicator */}
                    <div 
                      className="absolute top-1 bottom-1 bg-black dark:bg-white rounded-2xl transition-all duration-300 ease-out"
                      style={{
                        left: `calc(${activeTabIndex * 50}% + 4px)`,
                        width: 'calc(50% - 8px)'
                      }}
                    />
                    <ProfileTabButton label="My Posts" isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                    <ProfileTabButton label="Voted" isActive={activeTab === 'voted'} onClick={() => setActiveTab('voted')} />
                </div>
                
                <div
                  ref={contentRef}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {displayedPosts.length === 0 ? (
                      <div className="text-center py-20 px-4">
                          <p className="text-gray-500 dark:text-gray-400">{emptyStateMessage}</p>
                      </div>
                  ) : (
                      <PostMasonryGrid posts={displayedPosts} onSelect={onSelectPost} />
                  )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfileView;