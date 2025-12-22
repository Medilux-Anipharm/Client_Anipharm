import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/Auth/LoginScreen';
import SignUpScreen from './src/screens/Auth/SignUpScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import PetProfileCreationScreen from './src/screens/Pet/PetProfileCreationScreen';
import PetSuccessScreen from './src/screens/Pet/PetSuccessScreen';
import PetListScreen from './src/screens/Pet/PetListScreen';
import PetDetailScreen from './src/screens/Pet/PetDetailScreen';
import HealthCheckFormScreen from './src/screens/Health/HealthCheckFormScreen';
import HealthChatScreen from './src/screens/Health/HealthChatScreen';
import HealthResultScreen from './src/screens/Health/HealthResultScreen';
import { User } from './src/types/auth';
import { checkAuth } from './src/services/auth';

type Screen =
  | 'login'
  | 'signup'
  | 'home'
  | 'petProfile'
  | 'petSuccess'
  | 'petList'
  | 'petDetail'
  | 'healthCheckForm'
  | 'healthChat'
  | 'healthResult';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [healthCheckId, setHealthCheckId] = useState<number | null>(null);
  const [healthAssessment, setHealthAssessment] = useState<{
    triage_level: 'BLUE' | 'GREEN' | 'AMBER' | 'RED';
    recommended_actions: string[];
    health_check_summary: string;
  } | null>(null);

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

  // 반려동물 목록 화면으로 이동 (프로필 탭 클릭 시)
  const handleNavigateToPetList = () => {
    setCurrentScreen('petList');
  };

  // 반려동물 등록 화면으로 이동
  const handleNavigateToPetProfile = () => {
    setCurrentScreen('petProfile');
  };

  const handlePetProfileBack = () => {
    setCurrentScreen('petList'); // 등록 화면에서 뒤로가면 목록 화면으로
  };

  const handlePetProfileSuccess = () => {
    setCurrentScreen('petSuccess');
  };

  const handlePetSuccessComplete = () => {
    setCurrentScreen('petList'); // 성공 화면에서 완료하면 목록 화면으로
  };

  // 반려동물 목록 화면에서 뒤로가기
  const handlePetListBack = () => {
    setCurrentScreen('home');
  };

  // 반려동물 상세 화면으로 이동
  const handleNavigateToPetDetail = (petId: number) => {
    setSelectedPetId(petId);
    setCurrentScreen('petDetail');
  };

  // 반려동물 상세 화면에서 뒤로가기
  const handlePetDetailBack = () => {
    setCurrentScreen('petList');
  };

  // 반려동물 상세 화면에서 목록으로 이동 (삭제 후 등)
  const handlePetDetailToList = () => {
    setCurrentScreen('petList');
  };

  // 건강 상태 체크 화면으로 이동
  const handleNavigateToHealthCheckForm = (petId?: number) => {
    if (petId) {
      setSelectedPetId(petId);
    }
    setCurrentScreen('healthCheckForm');
  };

  // 건강 체크표 완료 후 대화 화면으로 이동
  const handleHealthCheckComplete = (petId: number, checkId: number) => {
    console.log('건강 체크표 완료:', { petId, checkId, petIdType: typeof petId, checkIdType: typeof checkId });
    // 숫자로 명시적 변환
    const numPetId = Number(petId);
    const numCheckId = Number(checkId);
    if (isNaN(numPetId) || isNaN(numCheckId)) {
      console.error('유효하지 않은 ID:', { petId, checkId });
      return;
    }
    setSelectedPetId(numPetId);
    setHealthCheckId(numCheckId);
    setCurrentScreen('healthChat');
  };

  // 건강 대화 화면에서 뒤로가기
  const handleHealthChatBack = () => {
    setCurrentScreen('healthCheckForm');
  };

  // 건강 평가 완료 후 결과 화면으로 이동
  const handleHealthAssessmentComplete = (assessment: {
    triage_level: 'BLUE' | 'GREEN' | 'AMBER' | 'RED';
    recommended_actions: string[];
    health_check_summary: string;
  }) => {
    setHealthAssessment(assessment);
    setCurrentScreen('healthResult');
  };

  // 건강 결과 화면에서 뒤로가기
  const handleHealthResultBack = () => {
    setHealthAssessment(null);
    setHealthCheckId(null);
    setCurrentScreen('home');
  };

  // 건강 결과 리포트 저장
  const handleHealthResultSave = async () => {
    // 리포트 저장 로직은 HealthResultScreen에서 처리
    // 여기서는 화면만 닫기
    handleHealthResultBack();
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
      ) : currentScreen === 'petList' ? (
        <PetListScreen
          onNavigateBack={handlePetListBack}
          onNavigateToDetail={handleNavigateToPetDetail}
          onNavigateToCreate={handleNavigateToPetProfile}
        />
      ) : currentScreen === 'petDetail' && selectedPetId ? (
        <PetDetailScreen
          petId={selectedPetId}
          onNavigateBack={handlePetDetailBack}
          onNavigateToList={handlePetDetailToList}
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
      ) : currentScreen === 'healthCheckForm' ? (
        <HealthCheckFormScreen
          petId={selectedPetId || undefined}
          onNavigateBack={() => setCurrentScreen('home')}
          onComplete={handleHealthCheckComplete}
        />
      ) : currentScreen === 'healthChat' && selectedPetId && healthCheckId ? (
        <HealthChatScreen
          petId={selectedPetId}
          healthCheckId={healthCheckId}
          onNavigateBack={handleHealthChatBack}
          onComplete={handleHealthAssessmentComplete}
        />
      ) : currentScreen === 'healthResult' && healthAssessment && selectedPetId && healthCheckId ? (
        <HealthResultScreen
          petId={selectedPetId}
          healthCheckId={healthCheckId}
          assessment={healthAssessment}
          onNavigateBack={handleHealthResultBack}
          onSaveReport={handleHealthResultSave}
        />
      ) : (
        <HomeScreen
          userData={userData}
          onLogout={handleLogout}
          onNavigateToPetProfile={handleNavigateToPetList}
          onNavigateToHealthCheck={handleNavigateToHealthCheckForm}
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
