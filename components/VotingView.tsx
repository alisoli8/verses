
import React from 'react';
import type { VsPost, User } from '../types';
import { RiArrowLeftLine } from 'react-icons/ri';
import PostCard from './PostCard';

// --- Main Voting View ---
interface VotingViewProps {
  post: VsPost;
  user: User | null;
  onBack: () => void;
  onClassicVote: (postId: string, option: 'A' | 'B') => void;
  onToggleSave: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onSharePost: (postId: string) => void;
  onFollow: (authorId: string) => void;
}

const VotingView: React.FC<VotingViewProps> = (props) => {
  const { post, user, onBack, onClassicVote, onToggleSave, onOpenComments, onSharePost, onFollow } = props;

  if (!post || !user || post.type !== 'classic') {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center text-white bg-gray-900">
            <p className="text-xl">Post not found or invalid type.</p>
            <button onClick={onBack} className="mt-4 text-brand-lime hover:underline">Go Back</button>
        </div>
    );
  }

  const isSaved = user.savedPostIds.has(post.id);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
      <header className="absolute top-0 left-0 z-20 p-4 w-full flex justify-start items-center bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onBack} className="bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors">
          <RiArrowLeftLine className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-grow flex relative pt-20 pb-4 justify-center items-center overflow-y-auto">
          <div className="w-full max-w-xl p-4 md:p-0">
              <PostCard 
                  post={post}
                  isSaved={isSaved}
                  currentUser={user}
                  isFollowing={user.following.has(post.author.id)}
                  onVote={onClassicVote}
                  onMatchUpVote={() => {}} // This view is only for classic posts
                  onToggleSave={onToggleSave}
                  onShare={onSharePost}
                  onFollow={onFollow}
                  onCommentClick={() => onOpenComments(post.id)}
                  onTitleClick={() => { /* No-op, already on detail view */ }}
                  onVotedCardClick={() => onOpenComments(post.id)}
              />
          </div>
      </main>
    </div>
  );
};

export default VotingView;
