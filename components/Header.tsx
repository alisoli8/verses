
import React, { useMemo } from 'react';
import type { VsPost, User, VsOption } from '../types';
import FeedView from './FeedView';
import PostCard from './PostCard';

interface SavedViewProps {
  posts: VsPost[];
  user: User | null;
  onSelectPost: (id: string, showComments?: boolean) => void;
  onToggleSave: (id: string) => void;
  onClassicVote: (id: string, option: 'A' | 'B') => void;
  onMatchUpVote: (postId: string, winner: VsOption, loser: VsOption, winnerSide: 'A' | 'B') => void;
  onSharePost: (id: string) => void;
  onCommentClick: (postId: string) => void;
  onFollow: (authorId: string) => void;
}

const SavedView: React.FC<SavedViewProps> = ({ posts, user, onSelectPost, onToggleSave, onClassicVote, onMatchUpVote, onSharePost, onCommentClick, onFollow }) => {
  const savedPosts = useMemo(() => {
    if (!user) return [];
    return posts.filter(p => user.savedPostIds.has(p.id))
      .sort((a,b) => b.id.localeCompare(a.id));
  }, [posts, user]);

  return (
    <div className="min-h-full flex flex-col">
        <div className="sticky top-0 bg-brand-off-white/80 dark:bg-black/80 backdrop-blur-lg z-10 p-4 pt-6 border-b border-gray-200 dark:border-gray-800">
             <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Saved Posts</h3>
            </div>
        </div>
         <div className="max-w-2xl mx-auto w-full p-2 sm:p-4">
            {savedPosts.length === 0 ? (
                <div className="text-center py-20 px-4">
                    <p className="text-gray-500 dark:text-gray-400">You haven't saved any posts yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {savedPosts.map(post => (
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

export default SavedView;