
import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { RiArrowLeftLine, RiSunLine, RiMoonLine } from 'react-icons/ri';

interface SettingsViewProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onBack, onUpdateUser, theme, onToggleTheme, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileUpdate = () => {
    onUpdateUser({ name, profileImageUrl });
  };
  
  const handleImageChangeClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (typeof loadEvent.target?.result === 'string') {
          setProfileImageUrl(loadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <header className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
          <RiArrowLeftLine className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-2">Settings</h1>
      </header>

      <Section title="Profile Information">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
            accept="image/*"
        />
        <div className="flex items-center space-x-4 mb-4">
            <img src={profileImageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            <button onClick={handleImageChangeClick} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Change Picture</button>
        </div>
        <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input 
                id="username"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
            />
        </div>
         <button onClick={handleProfileUpdate} className="mt-4 w-full bg-gray-800 dark:bg-brand-lime text-white dark:text-black font-bold py-2.5 rounded-lg hover:bg-black dark:hover:bg-opacity-90 transition-colors">
            Save Profile
        </button>
      </Section>
      
      <Section title="Account">
         <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 mb-2" />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5" />
        </div>
        <button className="mt-4 w-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Change Password
        </button>
      </Section>

      <Section title="Appearance">
        <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button onClick={onToggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-brand-lime' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                <div className="absolute inset-0 flex items-center justify-around w-full">
                    <RiSunLine className={`w-3 h-3 text-yellow-500 transition-opacity ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} />
                    <RiMoonLine className={`w-3 h-3 text-gray-900 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                </div>
            </button>
        </div>
      </Section>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={onLogout} 
          className="w-full bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400 font-bold py-2.5 rounded-lg hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors"
        >
            Logout
        </button>
      </div>

    </div>
  );
};

export default SettingsView;