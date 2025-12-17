import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import PetProfileCreationScreen from './src/screens/pet/PetProfileCreationScreen';
import PetSuccessScreen from './src/screens/pet/PetSuccessScreen';
import { User } from './src/types/auth';
import { checkAuth } from './src/services/auth';

type Screen = 'login' | 'signup' | 'home' | 'petProfile' | 'petSuccess';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoginSuccess = (user: User) => {
    setUserData(user);
    setCurrentScreen('home');
  };

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { token, user } = await checkAuth();
        if (token && user) {
          // 토큰과 사용자 정보가 있으면 자동 로그인
          setUserData(user);
          setCurrentScreen('home');
        } else {
          // 없으면 로그인 화면
          setCurrentScreen('login');
        }
      } catch (error) {
        console.error('인증 확인 실패:', error);
        setCurrentScreen('login');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 로그아웃 이벤트 리스너 (401 에러 시 자동 로그아웃)
    const handleLogoutEvent = () => {
      setUserData(null);
      setCurrentScreen('login');
    };

    // React Native Web 환경에서만 window 이벤트 사용
    // window.addEventListener가 함수인지 확인
    if (
      typeof window !== 'undefined' &&
      window.addEventListener &&
      typeof window.addEventListener === 'function' &&
      window.removeEventListener &&
      typeof window.removeEventListener === 'function'
    ) {
      try {
        window.addEventListener('auth:logout', handleLogoutEvent);
        return () => {
          try {
            window.removeEventListener('auth:logout', handleLogoutEvent);
          } catch (e) {
            // 무시
          }
        };
      } catch (e) {
        // window.addEventListener가 작동하지 않는 환경 (React Native)
        console.log('window 이벤트 리스너를 사용할 수 없습니다 (React Native 환경)');
      }
    }
  }, []);

  const handleLogout = async () => {
    const { logout } = await import('./src/services/auth');
    await logout();
    setUserData(null);
    setCurrentScreen('login');
  };

  const handleNavigateToPetProfile = () => {
    setCurrentScreen('petProfile');
  };

  const handlePetProfileBack = () => {
    setCurrentScreen('home');
  };

  const handlePetProfileSuccess = () => {
    setCurrentScreen('petSuccess');
  };

  const handlePetSuccessComplete = () => {
    setCurrentScreen('home');
  };

  // 로딩 중일 때 스플래시 화면 표시
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A3D" />
      </View>
    );
  }

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
      ) : currentScreen === 'petProfile' ? (
        <PetProfileCreationScreen
          onNavigateBack={handlePetProfileBack}
          onNavigateToSuccess={handlePetProfileSuccess}
        />
      ) : currentScreen === 'petSuccess' ? (
        <PetSuccessScreen
          onNavigateToHome={handlePetSuccessComplete}
        />
      ) : (
        <HomeScreen
          userData={userData}
          onLogout={handleLogout}
          onNavigateToPetProfile={handleNavigateToPetProfile}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
