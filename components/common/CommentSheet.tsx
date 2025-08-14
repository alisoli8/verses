
import React, { useState, useEffect, useRef } from 'react';
import type { VsPost, User, Comment } from '../../types';
import { RiArrowLeftLine, RiHeartFill, RiHeartLine, RiCloseLine } from 'react-icons/ri';

interface CommentItemProps {
    comment: Comment;
    user: User;
    onReply: (parentId: string, authorName: string) => void;
    onToggleLike: (commentId: string) => void;
    level: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, user, onReply, onToggleLike, level }) => {
    const [showReplies, setShowReplies] = useState(false);
    const isLiked = comment.likes.has(user.id);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div className={`flex items-start gap-3 ${level > 0 ? 'ml-6' : ''}`}>
            <img src={comment.author.profileImageUrl} alt={comment.author.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1" />
            <div className="flex-grow">
                <div className="bg-gray-800/80 rounded-2xl p-3">
                    <p className="font-semibold text-sm text-gray-200">{comment.author.name}</p>
                    <p className="text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                </div>
                <div className="flex items-center gap-3 mt-1.5 px-3">
                    <button onClick={() => onToggleLike(comment.id)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                        {isLiked ? <RiHeartFill className="w-4 h-4 text-red-500" /> : <RiHeartLine className="w-4 h-4" />}
                        {comment.likes.size > 0 && <span>{comment.likes.size}</span>}
                    </button>
                    <button onClick={() => onReply(comment.id, comment.author.name)} className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                        Reply
                    </button>
                </div>

                {hasReplies && !showReplies && (
                    <button onClick={() => setShowReplies(true)} className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-200">
                        <div className="w-6 h-px bg-gray-600"></div>
                        View {comment.replies.length} {comment.replies.length > 1 ? 'replies' : 'reply'}
                    </button>
                )}

                {hasReplies && showReplies && (
                    <div className="mt-4 space-y-4">
                        {comment.replies.map(reply => (
                             <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                user={user}
                                onReply={onReply} 
                                onToggleLike={onToggleLike} 
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
                 {hasReplies && showReplies && (
                    <button onClick={() => setShowReplies(false)} className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-200">
                        <div className="w-6 h-px bg-gray-600"></div>
                        Hide replies
                    </button>
                )}
            </div>
        </div>
    );
};

interface CommentSheetProps {
  post: VsPost | null;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (postId: string, text: string, parentId?: string) => void;
  onToggleCommentLike: (postId: string, commentId: string) => void;
}

const CommentSheet: React.FC<CommentSheetProps> = ({ post, user, isOpen, onClose, onAddComment, onToggleCommentLike }) => {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<{ parentId: string; authorName: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(newComment.trim() && post && user){
            onAddComment(post.id, newComment.trim(), replyingTo?.parentId);
            setNewComment('');
            setReplyingTo(null);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setNewComment('');
            setReplyingTo(null);
        }
    }, [isOpen]);
    
    useEffect(() => {
      if(replyingTo) {
          inputRef.current?.focus();
      }
    }, [replyingTo]);

    if (!post || !user) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div className="absolute inset-0 bg-black/60"></div>
            <div 
                className={`absolute bottom-0 left-0 right-0 w-full max-w-2xl mx-auto h-[85%] bg-gray-900 text-white rounded-t-2xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 flex items-center justify-center border-b border-gray-700 flex-shrink-0 relative">
                    <button onClick={onClose} className="absolute left-4 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full transition-colors" aria-label="Close comments">
                        <RiArrowLeftLine className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Comments</h2>
                </header>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {post.comments.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">No comments yet. Be the first!</p>
                        </div>
                    ) : (
                        post.comments.map(comment => (
                           <CommentItem 
                                key={comment.id}
                                comment={comment}
                                user={user}
                                onReply={(parentId, authorName) => setReplyingTo({parentId, authorName})}
                                onToggleLike={(commentId) => onToggleCommentLike(post.id, commentId)}
                                level={0}
                            />
                        ))
                    )}
                </div>
                
                <div className="p-2 border-t border-gray-700 flex-shrink-0 bg-gray-900">
                    {replyingTo && (
                        <div className="flex justify-between items-center px-4 py-1.5 text-sm text-gray-400">
                            <span>Replying to {replyingTo.authorName}</span>
                            <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full hover:bg-gray-700">
                                <RiCloseLine className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-center gap-3 p-2">
                        <img src={user.profileImageUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-grow bg-gray-800 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-lime"
                        />
                        <button type="submit" disabled={!newComment.trim()} className="font-semibold text-brand-lime disabled:text-gray-500 transition-colors">Post</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CommentSheet;
