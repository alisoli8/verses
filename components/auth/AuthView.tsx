import React, { useState } from 'react';
import SplashView from './SplashView';
import LoginView from './LoginView';
import SignupView from './SignupView';

type AuthScreen = 'splash' | 'login' | 'signup';

interface AuthViewProps {
  onLogin: (email: string) => void;
  onSignup: (name: string, email: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onSignup }) => {
  const [screen, setScreen] = useState<AuthScreen>('splash');

  switch (screen) {
    case 'login':
      return <LoginView onBack={() => setScreen('splash')} onLogin={onLogin} onGoToSignup={() => setScreen('signup')} />;
    case 'signup':
      return <SignupView onBack={() => setScreen('splash')} onSignup={onSignup} onGoToLogin={() => setScreen('login')} />;
    case 'splash':
    default:
      return <SplashView onGoToLogin={() => setScreen('login')} onGoToSignup={() => setScreen('signup')} />;
  }
};

export default AuthView;
