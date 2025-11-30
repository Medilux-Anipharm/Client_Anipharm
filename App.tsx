import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/Auth/LoginScreen';
import SignUpScreen from './src/screens/Auth/SignUpScreen';
import HomeScreen from './src/screens/Main/HomeScreen';
import { User } from './src/types/auth.types';

type Screen = 'login' | 'signup' | 'home';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userData, setUserData] = useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    setUserData(user);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('login');
  };

  return (
    <>
      {currentScreen === 'login' ? (
        <LoginScreen
          onNavigateToSignUp={() => setCurrentScreen('signup')}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : currentScreen === 'signup' ? (
        <SignUpScreen
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      ) : (
        <HomeScreen
          userData={userData}
          onLogout={handleLogout}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}
