import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/Auth/LoginScreen';
import SignUpScreen from './src/screens/Auth/SignUpScreen';

type Screen = 'login' | 'signup';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  return (
    <>
      {currentScreen === 'login' ? (
        <LoginScreen onNavigateToSignUp={() => setCurrentScreen('signup')} />
      ) : (
        <SignUpScreen onNavigateToLogin={() => setCurrentScreen('login')} />
      )}
      <StatusBar style="auto" />
    </>
  );
}
