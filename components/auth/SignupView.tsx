
import React, { useState } from 'react';
import { RiArrowLeftLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { FcGoogle } from 'react-icons/fc';


interface SignupViewProps {
  onBack: () => void;
  onSignup: (name: string, email: string, password: string) => void;
  onGoToLogin: () => void;
}

const SignupView: React.FC<SignupViewProps> = ({ onBack, onSignup, onGoToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password) {
      onSignup(name, email, password);
    }
  };

  return (
    <div className="min-h-screen w-full bg-brand-screen-color dark:bg-black text-gray-900 dark:text-gray-100 p-6 flex flex-col">
      <header className="flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
          <RiArrowLeftLine className="w-6 h-6" />
        </button>
      </header>
      <main className="flex-grow flex flex-col justify-center">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Join the Verses</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jannet"
                className="mt-1 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime outline-none transition"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime outline-none transition"
                required
              />
            </div>
            <div className="relative">
              <label htmlFor="password"className="text-sm font-medium text-gray-500 dark:text-gray-400">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 dark:bg-brand-lime text-white dark:text-black font-bold py-3.5 rounded-xl text-lg transition-transform transform hover:scale-105 disabled:opacity-50"
              disabled={!name || !email || !password}
            >
              Sign Up
            </button>
          </form>
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-200 dark:border-gray-700"/>
            <span className="mx-4 text-gray-400 dark:text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-200 dark:border-gray-700"/>
          </div>
          <button className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FcGoogle className="w-6 h-6" />
            Sign up with Google
          </button>
          <p className="mt-8 text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
            <button onClick={onGoToLogin} className="font-semibold text-brand-lime hover:underline">Log In</button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignupView;
