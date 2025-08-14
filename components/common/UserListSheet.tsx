
import React from 'react';
import type { User } from '../../types';
import { RiCloseLine } from 'react-icons/ri';

interface UserListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  usersToShow: User[];
  currentUser: User;
  onFollowToggle: (userId: string) => void;
}

const UserListSheet: React.FC<UserListSheetProps> = ({ isOpen, onClose, title, usersToShow, currentUser, onFollowToggle }) => {
    if (!isOpen) return null;

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
                <header className="p-4 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
                    <div className="w-8"></div> {/* Spacer */}
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full transition-colors" aria-label="Close">
                        <RiCloseLine className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto">
                    {usersToShow.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Nothing to see here.</p>
                        </div>
                    ) : (
                        <ul>
                            {usersToShow.map(user => {
                                const isFollowing = currentUser.following.has(user.id);
                                const isCurrentUser = user.id === currentUser.id;
                                const isFollower = title === 'Followers';

                                let buttonText = 'Follow';
                                if (isFollowing) {
                                    buttonText = 'Following';
                                } else if (isFollower) {
                                    buttonText = 'Follow Back'
                                }

                                return (
                                    <li key={user.id} className="p-4 flex items-center gap-4 hover:bg-gray-800/50">
                                        <img src={user.profileImageUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-200">{user.name}</p>
                                            <p className="text-sm text-gray-400">{`@${user.name.toLowerCase()}`}</p>
                                        </div>
                                        {!isCurrentUser && (
                                            <button
                                                onClick={() => onFollowToggle(user.id)}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors w-28 text-center ${
                                                    isFollowing
                                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                        : 'bg-white text-black hover:bg-gray-200'
                                                }`}
                                            >
                                                {buttonText}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListSheet;
