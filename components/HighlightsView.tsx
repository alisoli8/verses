import React from 'react';
import type { VsPost } from '../types';

interface HighlightsViewProps {
  posts: VsPost[];
  onSelectPost: (id: string, showComments?: boolean) => void;
}

const HighlightCard = ({ post, onSelect }: { post: VsPost, onSelect: (id: string, showComments?: boolean) => void }) => {
    if(!post.optionA || !post.optionB) return null;
    
    const shortTitle = `${post.optionA.name} vs ${post.optionB.name}`;

    return (
        <div 
            onClick={() => onSelect(post.id)}
            className="flex-shrink-0 w-32 cursor-pointer group"
        >
            <div
                className="relative w-full h-44 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:-translate-y-1 bg-gray-300 dark:bg-gray-800"
            >
                <img src={post.optionA.imageUrl} alt={post.optionA.name} className="absolute top-0 left-0 w-1/2 h-full object-cover" />
                <img src={post.optionB.imageUrl} alt={post.optionB.name} className="absolute top-0 right-0 w-1/2 h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"></div>
                <p className="absolute bottom-2 left-2 right-2 text-sm font-semibold text-white text-shadow-md truncate">{shortTitle}</p>
            </div>
        </div>
    );
};


const HighlightsView: React.FC<HighlightsViewProps> = ({ posts, onSelectPost }) => {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Latest Battles</h2>
      <div className="flex space-x-4 overflow-x-auto pb-3 -mx-2 px-2">
        {posts.map(post => (
          <HighlightCard key={`highlight-${post.id}`} post={post} onSelect={onSelectPost} />
        ))}
        <div className="flex-shrink-0 w-1"></div> {/* Spacer */}
      </div>
    </div>
  );
};

export default HighlightsView;
