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
            className="flex-shrink-0 w-44 cursor-pointer group"
        >
            <div
                className="relative w-full h-60 rounded-xl overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 bg-gray-300 dark:bg-gray-800"
            >
                <img 
                    src={post.optionA.imageUrl} 
                    alt={post.optionA.name} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    style={{
                        clipPath: 'polygon(0% 0%, 46% 0%, 52% 100%, 0% 100%)'
                    }}
                />
                <img 
                    src={post.optionB.imageUrl} 
                    alt={post.optionB.name} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    style={{
                        clipPath: 'polygon(42% 0%, 100% 0%, 100% 100%, 58% 100%)'
                    }}
                />
                
                {/* VS Separator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <img 
                    src="/img/vs-bw.svg" 
                    alt="VS" 
                    className="w-[25%] h-[100%] object-contain drop-shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"></div>
                <p className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white truncate">{shortTitle}</p>
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
      <h2 className="text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-3">Latest Battles</h2>
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
