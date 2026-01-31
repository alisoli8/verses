
import React, { useState, useMemo } from 'react';
import type { VsPost, User } from '../types';
import { RiSearch2Line } from 'react-icons/ri';

interface SearchViewProps {
  posts: VsPost[];
  user: User | null;
  onSelectPost: (id: string, showComments?: boolean) => void;
  onToggleSave: (id: string) => void;
  onClassicVote: (id: string, option: 'A' | 'B') => void;
  onSharePost: (id: string) => void;
  onEditPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onReportDuplicate?: (postId: string) => void;
  onHidePost?: (postId: string) => void;
}

export const PostGridItem: React.FC<{ post: VsPost, onSelect: (id: string, showComments?: boolean) => void, aspectRatio?: string }> = ({ post, onSelect, aspectRatio = '1 / 1' }) => (
    <div
        className="relative w-full rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-800 cursor-pointer group"
        style={{ aspectRatio }}
        onClick={() => onSelect(post.id)}
    >
        <img src={post.optionA?.imageUrl} alt={post.optionA?.name} className="absolute top-0 left-0 w-1/2 h-full object-cover" />
        <img src={post.optionB?.imageUrl} alt={post.optionB?.name} className="absolute top-0 right-0 w-1/2 h-full object-cover" />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center pointer-events-none">
            {/* Angled divider line */}
            <div 
                className="absolute h-full w-[4px] bg-gradient-to-b from-black via-white/80 to-black"
            />
            
            {/* VS image in center */}
            <img 
                src="/img/vs.svg" 
                alt="VS" 
                className="w-8 h-auto drop-shadow-lg"
            />
        </div>
    </div>
);

export const PostMasonryGrid: React.FC<{ posts: VsPost[]; onSelect: (id: string, showComments?: boolean) => void }> = ({ posts, onSelect }) => {
  const leftItems: React.ReactNode[] = [];
  const rightItems: React.ReactNode[] = [];

  for (let i = 0; i < posts.length; i += 2) {
    const pairIndex = Math.floor(i / 2);
    const tallOnRight = pairIndex % 2 === 0;

    const leftPost = posts[i];
    const rightPost = posts[i + 1];

    leftItems.push(
      <PostGridItem
        key={`masonry-left-${leftPost.id}`}
        post={leftPost}
        onSelect={onSelect}
        aspectRatio={tallOnRight ? '1 / 1' : '1 / 1.3'}
      />
    );

    if (rightPost) {
      rightItems.push(
        <PostGridItem
          key={`masonry-right-${rightPost.id}`}
          post={rightPost}
          onSelect={onSelect}
          aspectRatio={tallOnRight ? '1 / 1.3' : '1 / 1'}
        />
      );
    }
  }

  return (
    <div className="flex gap-0.5 p-2 pt-0.5">
      <div className="flex-1 flex flex-col gap-0.5">{leftItems}</div>
      <div className="flex-1 flex flex-col gap-0.5">{rightItems}</div>
    </div>
  );
};

const SearchResultItem: React.FC<{ post: VsPost, onSelect: (id: string, showComments?: boolean) => void }> = ({ post, onSelect }) => {
    if (!post.optionA || !post.optionB) return null;

    return (
        <div 
            onClick={() => onSelect(post.id)}
            className="flex items-center p-3 bg-white dark:bg-gray-800/50 rounded-lg cursor-pointer transition-transform transform hover:scale-[1.02]"
        >
            <div className="w-14 h-14 rounded-md bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 relative">
                <img src={post.optionA.imageUrl} alt={post.optionA.name} className="absolute top-0 left-0 w-1/2 h-full object-cover" />
                <img src={post.optionB.imageUrl} alt={post.optionB.name} className="absolute top-0 right-0 w-1/2 h-full object-cover" />
            </div>
            <div className="ml-4 flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{post.optionA.name} vs {post.optionB.name}</p>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight">{post.title}</h3>
            </div>
        </div>
    );
};


const SearchView: React.FC<SearchViewProps> = ({ posts, user, onSelectPost, onToggleSave, onClassicVote, onSharePost, onEditPost, onDeletePost, onReportDuplicate, onHidePost }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    if (!trimmedSearch) {
      return [];
    }
    return posts.filter(post =>
      post.title.toLowerCase().includes(trimmedSearch) ||
      (post.optionA && post.optionA.name.toLowerCase().includes(trimmedSearch)) ||
      (post.optionB && post.optionB.name.toLowerCase().includes(trimmedSearch))
    );
  }, [posts, searchTerm]);

  const showSearchResults = searchTerm.trim().length > 0;

  return (
    <div className="min-h-full flex flex-col">
        <div className="sticky top-0 bg-brand-off-white/80 dark:bg-black/80 backdrop-blur-lg z-10 p-4 pt-6 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-2xl mx-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <RiSearch2Line className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search by title or contender..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-800/50 border-transparent focus:ring-2 focus:ring-brand-lime focus:border-transparent rounded-lg pl-10 p-2.5 transition"
                    />
                </div>
            </div>
        </div>

        <div className="max-w-2xl mx-auto w-full">
            {showSearchResults ? (
                <div className="p-2">
                    {filteredPosts.length > 0 ? (
                        <div className="space-y-2">
                            {filteredPosts.map(post => (
                                <SearchResultItem key={`search-${post.id}`} post={post} onSelect={onSelectPost} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 px-4">
                            <p className="text-gray-500 dark:text-gray-400">{`No results for "${searchTerm}"`}</p>
                        </div>
                    )}
                </div>
            ) : (
                <PostMasonryGrid posts={posts} onSelect={onSelectPost} />
            )}
        </div>
    </div>
  );
};

export default SearchView;