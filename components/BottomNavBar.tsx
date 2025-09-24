
import React from 'react';
import { View } from '../types';
import { MdOutlineThumbsUpDown, MdThumbsUpDown, MdOutlineAccountCircle } from "react-icons/md";
import { RiSearch2Line, RiAddLine, RiUserSmileLine, RiUserSmileFill } from "react-icons/ri";
import { BiSearch } from 'react-icons/bi';
import { HiOutlineBookmark } from 'react-icons/hi';
import { HiBookmark } from "react-icons/hi2";


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
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
    >
      {isActive ? activeIcon : icon}
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-2 left-0 right-0 m-auto w-[90%] h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-[2em] flex items-center justify-around z-40">
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
              icon={<BiSearch className="w-7 h-7" />} 
              activeIcon={<BiSearch className="w-7 h-7 text-gray-900 dark:text-white" />}
            />
        </div>

        <div className="w-1/5 flex justify-center">
             <button
                onClick={() => onNavigate(View.CREATE)}
                className="w-16 h-16 bg-brand-lime rounded-3xl flex items-center justify-center text-gray-900 shadow-lg -mt-8 transform hover:scale-105 transition-transform"
                aria-label="Create Post"
              >
                <RiAddLine className="w-8 h-8" />
              </button>
        </div>

        <div className="flex justify-center w-1/5">
            <NavItem 
              isActive={currentView === View.SAVED} 
              onClick={() => onNavigate(View.SAVED)} 
              icon={<HiOutlineBookmark className="w-7 h-7" />} 
              activeIcon={<HiBookmark className="w-7 h-7" />}
            />
        </div>
        <div className="flex justify-center w-1/5">
            <NavItem 
              isActive={currentView === View.PROFILE} 
              onClick={() => onNavigate(View.PROFILE)} 
              icon={<RiUserSmileLine className="w-8 h-8" />} 
              activeIcon={<RiUserSmileFill className="w-8 h-8" />}
            />
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;
