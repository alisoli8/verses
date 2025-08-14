
import React from 'react';
import { View } from '../types';
import { MdOutlineThumbsUpDown, MdThumbsUpDown, MdOutlineAccountCircle } from "react-icons/md";
import { RiSearch2Line, RiAddLine, RiBookmarkLine, RiBookmarkFill } from "react-icons/ri";

interface BottomNavBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const NavItem = ({
  isActive,
  onClick,
  icon,
  activeIcon,
}: {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
    >
      {isActive ? activeIcon : icon}
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-around items-center w-full max-w-xl mx-auto">
        <div className="flex justify-center w-1/5">
            <NavItem 
              isActive={currentView === View.FEED} 
              onClick={() => onNavigate(View.FEED)} 
              icon={<MdOutlineThumbsUpDown className="w-8 h-8" />} 
              activeIcon={<MdThumbsUpDown className="w-8 h-8" />}
            />
        </div>
        <div className="flex justify-center w-1/5">
            <NavItem 
              isActive={currentView === View.SEARCH} 
              onClick={() => onNavigate(View.SEARCH)} 
              icon={<RiSearch2Line className="w-7 h-7" />} 
              activeIcon={<RiSearch2Line className="w-7 h-7 text-gray-900 dark:text-white" />}
            />
        </div>

        <div className="w-1/5 flex justify-center">
             <button
                onClick={() => onNavigate(View.CREATE)}
                className="w-16 h-16 bg-brand-lime rounded-full flex items-center justify-center text-gray-900 shadow-lg -mt-8 transform hover:scale-105 transition-transform"
                aria-label="Create Post"
              >
                <RiAddLine className="w-8 h-8" />
              </button>
        </div>

        <div className="flex justify-center w-1/5">
            <NavItem 
              isActive={currentView === View.SAVED} 
              onClick={() => onNavigate(View.SAVED)} 
              icon={<RiBookmarkLine className="w-7 h-7" />} 
              activeIcon={<RiBookmarkFill className="w-7 h-7" />}
            />
        </div>
        <div className="flex justify-center w-1/5">
            <NavItem 
              isActive={currentView === View.PROFILE} 
              onClick={() => onNavigate(View.PROFILE)} 
              icon={<MdOutlineAccountCircle className="w-8 h-8" />} 
              activeIcon={<MdOutlineAccountCircle className="w-8 h-8" />}
            />
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;
