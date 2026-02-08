import React from 'react';
import { VsIcon } from '../common/Icons';

interface SplashViewProps {
  onGoToSignup: () => void;
  onGoToLogin: () => void;
}

const SplashView: React.FC<SplashViewProps> = ({ onGoToSignup, onGoToLogin }) => {
  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen w-full bg-gray-900 text-white p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-80 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5 z-0"></div>

      <div className="z-10 mt-24">
        <h1 className="text-5xl font-extrabold mt-4 tracking-tight">Create epic battles. Let the world decide the winner.</h1>
        <p className="mt-4 text-lg text-gray-400 max-w-md mx-auto">
          anything and everyhing  
        </p>
      </div>

      <div className="z-10 w-full max-w-sm mb-8">
        <button
          onClick={onGoToSignup}
          className="w-full bg-brand-lime text-gray-900 font-bold py-4 rounded-2xl text-lg transition-transform transform hover:scale-105"
        >
          Get Started
        </button>
        <button
          onClick={onGoToLogin}
          className="w-full mt-4 text-brand-lime font-bold py-4 rounded-2xl border border-brand-lime text-lg hover:bg-white/10 transition-colors"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default SplashView;
