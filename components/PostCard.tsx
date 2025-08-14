
import React, { useState, useMemo } from 'react';
import type { User, VsPost, VsOption, Comment } from '../types';
import { RiBookmarkFill, RiBookmarkLine, RiHeartFill, RiHeartLine, RiShare2Line, RiMore2Fill, RiCheckLine } from 'react-icons/ri';
import { BiMessageSquareDots } from 'react-icons/bi';
import { FiThumbsUp } from 'react-icons/fi';

interface PostCardProps {
  post: VsPost;
  isSaved: boolean;
  currentUser: User;
  isFollowing: boolean;
  onVote: (id: string, option: 'A' | 'B') => void;
  onMatchUpVote: (postId: string, winner: VsOption, loser: VsOption, winnerSide: 'A' | 'B') => void;
  onToggleSave: (id: string) => void;
  onShare: (id: string) => void;
  onFollow: (authorId: string) => void;
  onCommentClick?: () => void;
  onTitleClick?: () => void;
  onVotedCardClick?: () => void;
}

const countTotalComments = (comments: Comment[]): number => {
    let count = comments.length;
    for (const comment of comments) {
        if (comment.replies && comment.replies.length > 0) {
            count += countTotalComments(comment.replies);
        }
    }
    return count;
};

const MatchUpSummary: React.FC<{post: VsPost}> = ({ post }) => {
    const resultsMap = useMemo(() => {
        const map = new Map<string, { votes: number, totalVotes: number }>();
        if (!post.roundResults) return map;

        for (const round of post.roundResults) {
            const total = round.contenderA.votes + round.contenderB.votes;
            map.set(round.contenderA.name, { votes: round.contenderA.votes, totalVotes: total });
            map.set(round.contenderB.name, { votes: round.contenderB.votes, totalVotes: total });
        }
        return map;
    }, [post.roundResults]);
    
    const sortedChallengers = useMemo(() => {
        if (!post.initialChallengers) return [];
        return [...post.initialChallengers].sort((a, b) => {
            if (a.name === post.champion?.name) return -1;
            if (b.name === post.champion?.name) return 1;
            
            const aResult = resultsMap.get(a.name) ?? { votes: 0, totalVotes: 1 };
            const bResult = resultsMap.get(b.name) ?? { votes: 0, totalVotes: 1 };
            const aPerc = aResult.totalVotes > 0 ? aResult.votes / aResult.totalVotes : 0;
            const bPerc = bResult.totalVotes > 0 ? bResult.votes / bResult.totalVotes : 0;

            if (bPerc !== aPerc) {
                return bPerc - aPerc;
            }
            return a.name.localeCompare(b.name);
        });
    }, [post.initialChallengers, post.champion, resultsMap]);


    return (
        <div className="w-full h-full flex flex-col items-center justify-start text-white p-4 relative overflow-y-auto bg-gray-900">
            <div className="text-center pt-2 pb-4">
                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Champion</h2>
                <h1 className="text-4xl font-extrabold text-shadow-lg mt-1">{post.champion?.name}</h1>
            </div>
            <div className="w-full space-y-2">
                {sortedChallengers.map(challenger => {
                    const result = resultsMap.get(challenger.name) ?? { votes: 0, totalVotes: 0 };
                    const percentage = result.totalVotes > 0 ? Math.round((result.votes / result.totalVotes) * 100) : 0;
                    const isChampion = challenger.name === post.champion?.name;
                    const isUserPick = post.userPicks?.includes(challenger.name);

                    return (
                        <div key={challenger.name} className={`rounded-lg p-2 flex items-center gap-3 ${isChampion ? 'bg-amber-400/20' : 'bg-black/30'}`}>
                            <img src={challenger.imageUrl} alt={challenger.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0"/>
                            <div className="flex-grow">
                                <span className={`font-bold ${isChampion ? 'text-amber-300' : ''}`}>{challenger.name}</span>
                                {isUserPick && <span className="text-xs ml-2 text-brand-lime">(Your Pick)</span>}
                            </div>
                            <div className="w-24 text-right">
                                {isChampion ? (
                                    <div>
                                        <span className="font-bold text-amber-300">Winner</span>
                                        <span className="block text-xs text-amber-200">{percentage}%</span>
                                    </div>
                                ) : (
                                    <span className="font-semibold">{percentage}%</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};


const PostCard: React.FC<PostCardProps> = ({ post, isSaved, currentUser, isFollowing, onVote, onMatchUpVote, onToggleSave, onShare, onFollow, onCommentClick, onTitleClick, onVotedCardClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const totalComments = useMemo(() => countTotalComments(post.comments), [post.comments]);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(post.id);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollow(post.author.id);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(current => {
        const newLikedState = !current;
        setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
        return newLikedState;
    });
  };
  
  const handleSideClick = (side: 'A' | 'B') => {
    if (post.type === 'classic') {
        if (post.userVote === null) {
            onVote(post.id, side);
        }
    } else if (post.type === 'match-up' && post.optionA && post.optionB) {
        if (post.champion || post.currentRoundVoted) return;
        const winner = side === 'A' ? post.optionA : post.optionB;
        const loser = side === 'A' ? post.optionB : post.optionA;
        onMatchUpVote(post.id, winner, loser, side);
    }
  };
  
  const handleCommentButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onCommentClick?.();
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(post.id);
  }

  if (!post.optionA || !post.optionB) {
      if (post.type === 'classic' || (post.type === 'match-up' && !post.champion)) {
          return null;
      }
  }

  const totalVotes = (post.optionA?.votes ?? 0) + (post.optionB?.votes ?? 0);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-3xl shadow-md flex flex-col w-full border border-gray-200 dark:border-gray-700/50 overflow-hidden">
        <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700/50">
            <img src={post.author.profileImageUrl} alt={post.author.name} className="w-9 h-9 rounded-full object-cover" />
            <div className="ml-3 flex items-center">
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{post.author.name}</span>
                {currentUser.id !== post.author.id && (
                    <>
                        <span className="text-gray-400 dark:text-gray-500 mx-1.5 font-bold">·</span>
                        <button onClick={handleFollowClick} className={`text-sm font-bold transition-colors ${isFollowing ? 'text-gray-500 dark:text-gray-400' : 'text-blue-500 hover:text-blue-600'}`}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </>
                )}
            </div>
            <div className="flex-grow"></div>
             <button onClick={handleShareClick} className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <RiShare2Line className="w-6 h-6" />
            </button>
            <button className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <RiMore2Fill className="w-6 h-6" />
            </button>
        </div>

        <div className="relative w-full bg-black" style={{ aspectRatio: '1 / 1' }}>
          {post.type === 'match-up' && post.champion ? (
            <MatchUpSummary post={post} />
           ) : post.type === 'classic' && post.userVote !== null ? (
             <div className="flex h-full cursor-pointer" onClick={onVotedCardClick}>
                {(() => {
                    const isWinnerA = post.optionA!.votes >= post.optionB!.votes;
                    const isWinnerB = post.optionB!.votes > post.optionA!.votes;

                    const ResultImage = ({ option, isWinner, isVoted }: { option: VsOption, isWinner: boolean, isVoted: boolean }) => {
                        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                        return (
                            <div className={`w-1/2 h-full relative transition-opacity duration-500 ${isWinner ? 'opacity-100' : 'opacity-60'}`}>
                                <img src={option.imageUrl} alt={option.name} className="w-full h-full object-cover" />
                                {isVoted && (
                                    <div className="absolute top-2 right-2 bg-brand-lime text-black rounded-full p-1 shadow-lg">
                                        <RiCheckLine className="w-4 h-4" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-white">
                                    <p className={`font-black text-5xl text-shadow-lg ${isWinner ? 'text-white' : 'text-gray-300'}`}>{percentage}%</p>
                                    <p className="text-base font-semibold text-gray-300 text-shadow-md mt-1">{option.votes.toLocaleString()} votes</p>
                                </div>
                            </div>
                        );
                    };

                    return (
                        <>
                            <ResultImage option={post.optionA!} isWinner={isWinnerA} isVoted={post.userVote === 'A'} />
                            <ResultImage option={post.optionB!} isWinner={isWinnerB} isVoted={post.userVote === 'B'} />
                        </>
                    );
                })()}
            </div>
          ) : (
            <div className="flex h-full">
               {['A', 'B'].map((side) => {
                    const option = side === 'A' ? post.optionA! : post.optionB!;
                    const isRoundVoted = post.type === 'match-up' && post.currentRoundVoted;
                    const userPickedThis = isRoundVoted && post.userPicks?.includes(option.name);
                    const showThumbsUp = post.type === 'match-up' && !post.champion && !isRoundVoted && post.userChampionSide === side;
                    const percentage = isRoundVoted && totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

                    return (
                         <div key={side} className={`w-1/2 h-full relative group ${isRoundVoted ? '' : 'cursor-pointer'}`} onClick={() => handleSideClick(side as 'A'|'B')}>
                            {showThumbsUp && (
                                <div className="absolute top-3 left-3 z-10 p-1.5 bg-black/50 rounded-full">
                                    <FiThumbsUp className="w-6 h-6 text-brand-lime" />
                                </div>
                            )}
                            <img src={option.imageUrl} alt={option.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent"></div>
                             
                            <div className="absolute bottom-4 left-4 right-4 text-white text-center text-shadow-md">
                                {isRoundVoted ? (
                                    <>
                                        <div className="flex items-center justify-center font-bold text-xl">
                                            {userPickedThis && <RiCheckLine className="w-5 h-5 mr-2 text-brand-lime stroke-[2]" />}
                                            <span>{option.name}</span>
                                        </div>
                                        <p className="font-bold text-3xl mt-1">{percentage}%</p>
                                    </>
                                ) : (
                                    <p className="font-bold text-xl">{option.name}</p>
                                )}
                            </div>
                        </div>
                    );
               })}
            </div>
          )}
          
          {!(post.type === 'match-up' && post.champion) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/80">
                  <span className="text-white font-black text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>VS</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
            <div className="flex items-center">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                         <button onClick={handleLikeClick} className={`p-1 -ml-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:hover:text-red-400'}`}>
                            {isLiked ? <RiHeartFill className="w-7 h-7" /> : <RiHeartLine className="w-7 h-7" />}
                        </button>
                        {likeCount > 0 && <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{likeCount.toLocaleString()}</span>}
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <button onClick={handleCommentButtonClick} className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
                            <BiMessageSquareDots className="w-7 h-7" />
                        </button>
                         {totalComments > 0 && <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{totalComments}</span>}
                    </div>
                </div>

                <div className="flex-grow" />
                <button onClick={handleSaveClick} className="p-1" aria-label="Save post">
                    {isSaved ? <RiBookmarkFill className="w-7 h-7 text-brand-lime" /> : <RiBookmarkLine className="w-7 h-7 text-gray-500 hover:text-brand-lime/80 dark:hover:text-brand-lime" />}
                </button>
            </div>
            
            <div className="mt-3">
                 {post.type === 'classic' && post.userVote === null && totalVotes > 0 ? (
                     <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                        {totalVotes.toLocaleString()} votes
                    </p>
                ) : post.type === 'match-up' && !post.champion && !post.currentRoundVoted ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Match Up: {post.eliminated?.length || 0} eliminated, {((post.challengers?.length || 0) + 2)} remaining
                    </p>
                ) : null}
            </div>

            <div onClick={onTitleClick} className="mt-2 text-gray-800 dark:text-gray-200 cursor-pointer">
                <p className="inline">
                    <span className="font-bold hover:underline">{post.author.name}</span>
                    <span className="text-gray-600 dark:text-gray-400"> {post.title}</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default PostCard;
