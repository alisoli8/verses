
import React, { useState, useMemo } from 'react';
import type { User, VsPost, VsOption, Comment } from '../types';
import { RiHeartFill, RiHeartLine, RiShare2Line, RiMore2Fill, RiCheckLine, RiEditLine, RiDeleteBinLine, RiFlag2Line, RiEyeOffLine } from 'react-icons/ri';
import { BiMessageSquareDots } from 'react-icons/bi';
import { FiThumbsUp } from 'react-icons/fi';
import { PiHeartBold, PiHeartFill } from "react-icons/pi";
import { HiOutlineBookmark } from 'react-icons/hi';
import { HiBookmark } from "react-icons/hi2";

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
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReportDuplicate?: (postId: string) => void;
  onHide?: (postId: string) => void;
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
                <h1 className="text-4xl font-extrabold mt-1">{post.champion?.name}</h1>
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


const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isSaved, 
  currentUser, 
  isFollowing, 
  onVote, 
  onMatchUpVote, 
  onToggleSave, 
  onShare, 
  onFollow, 
  onCommentClick, 
  onTitleClick, 
  onVotedCardClick,
  onEdit,
  onDelete,
  onReportDuplicate,
  onHide
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showMoreMenu) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMoreMenu]);

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

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  };

  const handleMenuAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    
    switch (action) {
      case 'edit':
        onEdit?.(post.id);
        break;
      case 'delete':
        onDelete?.(post.id);
        break;
      case 'report':
        onReportDuplicate?.(post.id);
        break;
      case 'hide':
        onHide?.(post.id);
        break;
    }
  };

  if (!post.optionA || !post.optionB) {
      if (post.type === 'classic' || (post.type === 'match-up' && !post.champion)) {
          return null;
      }
  }

  const totalVotes = (post.optionA?.votes ?? 0) + (post.optionB?.votes ?? 0);

  return (
    <div className="dark:bg-gray-800/50 rounded-3xl flex flex-col w-full border border-gray-400/70 dark:border-gray-300/50 overflow-hidden">
        <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-300/50">
            <img src={post.author.profileImageUrl} alt={post.author.name} className="w-9 h-9 rounded-xl object-cover" />
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
             <button onClick={handleShareClick} className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mr-3">
                <RiShare2Line className="w-6 h-6" />
            </button>
            <div className="relative">
                <button onClick={handleMoreClick} className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                    <RiMore2Fill className="w-6 h-6" />
                </button>
                
                {showMoreMenu && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-48">
                        {currentUser.id === post.author.id ? (
                            // Creator options
                            <>
                                <button
                                    onClick={(e) => handleMenuAction('edit', e)}
                                    disabled={totalVotes > 0}
                                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 ${
                                        totalVotes > 0 
                                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    title={totalVotes > 0 ? 'Cannot edit post with votes' : ''}
                                >
                                    <RiEditLine className="w-4 h-4" />
                                    Edit Post
                                </button>
                                <button
                                    onClick={(e) => handleMenuAction('delete', e)}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                                >
                                    <RiDeleteBinLine className="w-4 h-4" />
                                    Delete Post
                                </button>
                            </>
                        ) : (
                            // General user options
                            <>
                                <button
                                    onClick={(e) => handleMenuAction('report', e)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                                >
                                    <RiFlag2Line className="w-4 h-4" />
                                    Report as Duplicate
                                </button>
                                <button
                                    onClick={(e) => handleMenuAction('hide', e)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                                >
                                    <RiEyeOffLine className="w-4 h-4" />
                                    Hide Post
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>

        <div className="relative w-full bg-black" style={{ aspectRatio: post.aspectRatio || '1 / 1.5' }}>
          {post.type === 'match-up' && post.champion ? (
            <MatchUpSummary post={post} />
           ) : post.type === 'classic' && post.userVote !== null ? (
             <div className="relative h-full overflow-hidden">
                {(() => {
                    const isWinnerA = post.optionA!.votes >= post.optionB!.votes;
                    const isWinnerB = post.optionB!.votes > post.optionA!.votes;

                    const ResultImage = ({ option, isWinner, isVoted, side }: { option: VsOption, isWinner: boolean, isVoted: boolean, side: 'A' | 'B' }) => {
                        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                        const backgroundColor = option.backgroundColor || (side === 'A' ? '#000000' : '#000000');
                        const imageTransform = option.imageTransform || { scale: 1, translateX: 0, translateY: 0, objectFit: 'cover' };
                        const objectFit = imageTransform.objectFit || 'cover';
                        // Check if user has custom scale/translate positioning
                        const hasCustomPositioning = imageTransform.scale !== 1 || 
                            imageTransform.translateX !== 0 || 
                            imageTransform.translateY !== 0;
                        
                        return (
                            <div 
                                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isWinner ? 'opacity-100' : 'opacity-95'}`}
                                style={{
                                    clipPath: side === 'A' 
                                        ? 'polygon(0% 0%, 46% 0%, 52% 100%, 0% 100%)' 
                                        : 'polygon(46% 0%, 100% 0%, 100% 100%, 52% 100%)',
                                    backgroundColor,
                                    transformOrigin: 'center center'
                                }}
                            >
                                <div className={`absolute inset-0 flex items-center ${side === 'A' ? 'justify-start' : 'justify-end'}`}>
                                    <div className="relative w-[55%] h-full">
                                        {hasCustomPositioning ? (
                                            <img 
                                                src={option.imageUrl} 
                                                alt={option.name} 
                                                className="absolute select-none"
                                                style={{
                                                    top: '50%',
                                                    left: '50%',
                                                    width: 'auto',
                                                    height: 'auto',
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit,
                                                    transform: `translate(-50%, -50%) scale(${imageTransform.scale}) translate(${imageTransform.translateX}px, ${imageTransform.translateY}px)`,
                                                    transformOrigin: 'center'
                                                }}
                                            />
                                        ) : (
                                            <img 
                                                src={option.imageUrl} 
                                                alt={option.name} 
                                                className="w-full h-full"
                                                style={{
                                                    objectFit
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                                {/* {isVoted && (
                                    <div className="absolute top-3 right-3 bg-brand-lime text-black rounded-full p-1.5 shadow-lg z-10">
                                        <RiCheckLine className="w-5 h-5" />
                                    </div>
                                )} */}
                                <div className={`absolute inset-0 ${isWinner ? 'bg-black/25' : 'bg-black/50'} flex flex-col justify-end p-6 text-white ${side === 'A' ? 'text-left' : 'text-right'}`}>
                                    <h3 className={`font-bold text-7xl leading-[.6] tracking-[-3px] ${isWinner ? 'text-brand-lime' : 'text-gray-200'}`}>{percentage}<span className="text-4xl ml-1">%</span></h3>
                                    <h5 className={`text-base font-semibold ${isWinner ? 'text-brand-lime' : 'text-gray-300'}`}>{option.votes.toLocaleString()} votes</h5>
                                </div>
                            </div>
                        );
                    };

                    return (
                        <>
                            <ResultImage option={post.optionA!} isWinner={isWinnerA} isVoted={post.userVote === 'A'} side="A" />
                            <ResultImage option={post.optionB!} isWinner={isWinnerB} isVoted={post.userVote === 'B'} side="B" />
                            
                            {/* VS Separator with CSS divider and VS image */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 left-[-10px]">
                              {/* Angled divider line */}
                              <div 
                                className="absolute h-full w-[6px] bg-gradient-to-b from-black via-white/80 to-black"
                                style={{
                                  transform: 'rotate(-2deg)',
                                }}
                              />
                              
                              {/* VS image in center */}
                              <img 
                                src="/img/vs.svg" 
                                alt="VS" 
                                className="w-14 h-auto drop-shadow-lg"
                              />
                            </div>
                        </>
                    );
                })()}
            </div>
          ) : (
            <div className="relative h-full overflow-hidden">
               {['A', 'B'].map((side) => {
                    const option = side === 'A' ? post.optionA! : post.optionB!;
                    const isRoundVoted = post.type === 'match-up' && post.currentRoundVoted;
                    const userPickedThis = isRoundVoted && post.userPicks?.includes(option.name);
                    const showThumbsUp = post.type === 'match-up' && !post.champion && !isRoundVoted && post.userChampionSide === side;
                    const percentage = isRoundVoted && totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    const backgroundColor = option.backgroundColor || (side === 'A' ? '#000000' : '#000000');
                    const imageTransform = option.imageTransform || { scale: 1, translateX: 0, translateY: 0, objectFit: 'cover' };
                    const objectFit = imageTransform.objectFit || 'cover';
                    // Check if user has custom scale/translate positioning
                    const hasCustomPositioning = imageTransform.scale !== 1 || 
                        imageTransform.translateX !== 0 || 
                        imageTransform.translateY !== 0;

                    return (
                         <div 
                            key={side} 
                            className={`absolute inset-0 w-[55%] h-full group ${isRoundVoted ? '' : 'cursor-pointer'}`} 
                            style={{
                                clipPath: side === 'A' 
                                    ? 'polygon(85% 0%, 0% 0%, 0% 100%, 95% 100%)' 
                                    : 'polygon(2% 0%, 100% 0%, 100% 100%, 12% 100%)',
                                backgroundColor,
                                transformOrigin: 'center center',
                                marginLeft: side === 'B' ? 'auto' : '0',
                            }}
                            onClick={() => handleSideClick(side as 'A'|'B')}
                         >
                            {showThumbsUp && (
                                <div className="absolute top-3 left-3 z-10 p-1.5 bg-black/50 rounded-full">
                                    <FiThumbsUp className="w-6 h-6 text-brand-lime" />
                                </div>
                            )}
                            {hasCustomPositioning ? (
                                <img 
                                    src={option.imageUrl} 
                                    alt={option.name} 
                                    className="absolute select-none"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        width: 'auto',
                                        height: 'auto',
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit,
                                        transform: `translate(-50%, -50%) scale(${imageTransform.scale}) translate(${imageTransform.translateX}px, ${imageTransform.translateY}px)`,
                                        transformOrigin: 'center'
                                    }}
                                />
                            ) : (
                                <img 
                                    src={option.imageUrl} 
                                    alt={option.name} 
                                    className="w-full h-full"
                                    style={{
                                        objectFit
                                    }}
                                />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-gradient-to-t from-black/60 to-transparent"></div>
                             
                            <div className={`absolute bottom-6 left-6 right-6 text-white ${side === 'A' ? 'text-left' : 'text-right'}`}>
                                {isRoundVoted ? (
                                    <>
                                        <div className="flex items-center justify-center font-bold text-xl">
                                            {userPickedThis && <RiCheckLine className="w-5 h-5 mr-2 text-brand-lime stroke-[2]" />}
                                            <span>{option.name}</span>
                                        </div>
                                        <p className="font-bold text-3xl mt-1">{percentage}%</p>
                                    </>
                                ) : (
                                    <h5 className="font-semibold text-md">{option.name}</h5>
                                )}
                            </div>
                        </div>
                    );
               })}
               
               {/* VS Separator with CSS divider and VS image */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 left-[-10px]">
                 {/* Angled divider line */}
                 <div 
                   className="absolute h-full w-[6px] bg-gradient-to-b from-black via-white/80 to-black"
                   style={{
                     transform: 'rotate(-2deg)',
                   }}
                 />
                 
                 {/* VS image in center */}
                 <img 
                   src="/img/vs.svg" 
                   alt="VS" 
                   className="w-14 h-auto drop-shadow-lg"
                 />
               </div>
            </div>
          )}
        </div>

        <div className="p-4">
            <div className="flex items-center">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                         <button onClick={handleLikeClick} className={`p-1 -ml-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:hover:text-red-400'}`}>
                            {isLiked ? <PiHeartFill size={24} /> : <PiHeartBold size={24} />}
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
                    {isSaved ? <HiBookmark className="w-7 h-7 text-gray-700 dark:text-brand-lime" /> : <HiOutlineBookmark className="w-7 h-7 text-gray-500 hover:text-brand-lime/80 dark:hover:text-brand-lime" />}
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
                {post.optionA && post.optionB && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {post.optionA.name} <span className="text-gray-600 dark:text-gray-400">vs</span> {post.optionB.name}
                    </p>
                )}
            </div>
        </div>
    </div>
  );
};

export default PostCard;
