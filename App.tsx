import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import LoginScreen from './src/screens/Auth/LoginScreen';
import SignUpScreen from './src/screens/Auth/SignUpScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import PetProfileCreationScreen from './src/screens/pet/PetProfileCreationScreen';
import PetSuccessScreen from './src/screens/pet/PetSuccessScreen';
import PetListScreen from './src/screens/pet/PetListScreen';
import PetDetailScreen from './src/screens/pet/PetDetailScreen';
import HealthCheckFormScreen from './src/screens/Health/HealthCheckFormScreen';
import HealthChatScreen from './src/screens/Health/HealthChatScreen';
import HealthResultScreen from './src/screens/Health/HealthResultScreen';
import CareChatScreen from './src/screens/Care/CareChatScreen';
import CareInboxScreen from './src/screens/Care/CareInboxScreen';
import CareArchiveDetailScreen from './src/screens/Care/CareArchiveDetailScreen';
import CommunityScreen from './src/screens/Community/CommunityScreen';
import PostWriteScreen from './src/screens/Community/PostWriteScreen';
import PostDetailScreen from './src/screens/Community/PostDetailScreen';
import PickupProductListScreen from './src/screens/Pickup/PickupProductListScreen';
import PickupPharmacySelectScreen, { DummyPharmacy } from './src/screens/Pickup/PickupPharmacySelectScreen';
import PickupRequestConfirmScreen from './src/screens/Pickup/PickupRequestConfirmScreen';
import PickupStatusScreen from './src/screens/Pickup/PickupStatusScreen';
import PickupHistoryScreen from './src/screens/Pickup/PickupHistoryScreen';
import PlaceDetailScreen from './src/screens/map/PlaceDetailScreen';
import ReviewWriteScreen from './src/screens/review/ReviewWriteScreen';
import ReviewDetailScreen from './src/screens/review/ReviewDetailScreen';
import { User } from './src/types/auth';
import { BoardType } from './src/types/community';
import { PickupProduct } from './src/types/pickup';
import { VeterinaryHospital } from './src/types/hospital';
import { VeterinaryPharmacy } from './src/types/pharmacy';
import { checkAuth } from './src/services/auth';
import { startCareManagementChat } from './src/services/healthChatbot';
import { getPets } from './src/services/pet';
import eventEmitter from './src/utils/eventEmitter';

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
  | 'healthResult'
  | 'careChat'
  | 'careInbox'
  | 'careArchiveDetail'
  | 'community'
  | 'postWrite'
  | 'postDetail'
  | 'pickupProductList'
  | 'pickupPharmacySelect'
  | 'pickupRequestConfirm'
  | 'pickupStatus'
  | 'pickupHistory'
  | 'pickupDetail'
  | 'placeDetail'
  | 'reviewWrite'
  | 'reviewDetail'
  | 'reviewEdit';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [healthCheckId, setHealthCheckId] = useState<number | null>(null);
  const [careConversationId, setCareConversationId] = useState<number | null>(null);
  const [homeInitialTab, setHomeInitialTab] = useState<'home' | 'chatbot' | 'community' | 'journal' | 'profile' | undefined>(undefined);
  const [healthAssessment, setHealthAssessment] = useState<{
    triage_level: 'BLUE' | 'GREEN' | 'AMBER' | 'RED';
    recommended_actions: string[];
    health_check_summary: string;
  } | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [postBoardType, setPostBoardType] = useState<BoardType>('free');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    locationName: string;
  } | null>(null);
  const [selectedPickupCategoryId, setSelectedPickupCategoryId] = useState<string | null>(null);
  const [selectedPickupProducts, setSelectedPickupProducts] = useState<Array<{
    product: PickupProduct;
    quantity: number;
  }>>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<DummyPharmacy | null>(null);
  const [selectedPickupRequestId, setSelectedPickupRequestId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<{
    type: 'pharmacy' | 'hospital';
    place: VeterinaryPharmacy | VeterinaryHospital;
  } | null>(null);
  const [reviewWriteParams, setReviewWriteParams] = useState<{
    type: 'pharmacy' | 'hospital';
    placeId: number;
    placeName: string;
    reviewId?: number; // 수정 모드일 때
  } | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

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
      console.log('로그아웃 이벤트 수신: 로그인 화면으로 이동');
      setUserData(null);
      setCurrentScreen('login');
    };

    // EventEmitter를 사용한 크로스 플랫폼 이벤트 리스너
    eventEmitter.on('auth:logout', handleLogoutEvent);

    // 클린업 함수
    return () => {
      eventEmitter.off('auth:logout', handleLogoutEvent);
    };
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

  // 케어 관리 상담 시작
  const handleNavigateToCareChat = async (petId?: number) => {
    console.log('[App] handleNavigateToCareChat 호출됨', { petId, selectedPetId });
    
    let targetPetId = petId || selectedPetId;
    
    // petId가 없으면 기본 반려동물 가져오기
    if (!targetPetId) {
      console.log('[App] petId가 없음, 기본 반려동물 조회 시작');
      try {
        const petsResponse = await getPets();
        if (petsResponse.success && petsResponse.data && petsResponse.data.length > 0) {
          const primaryPet = petsResponse.data.find((p) => p.isPrimary) || petsResponse.data[0];
          targetPetId = Number(primaryPet.petId);
          console.log('[App] 기본 반려동물 선택됨', { targetPetId, petName: primaryPet.name });
        } else {
          console.warn('[App] 등록된 반려동물이 없음');
          Alert.alert('알림', '반려동물을 먼저 등록해주세요.');
          return;
        }
      } catch (error: any) {
        console.error('[App] 반려동물 목록 조회 실패:', error);
        Alert.alert('오류', '반려동물 정보를 불러오는데 실패했습니다.');
        return;
      }
    }

    if (!targetPetId) {
      console.warn('[App] targetPetId가 여전히 없음');
      return;
    }

    console.log('[App] 케어 관리 상담 시작', { targetPetId });

    try {
      // 새 대화 시작
      console.log('[App] startCareManagementChat API 호출 시작');
      const response = await startCareManagementChat(targetPetId);
      console.log('[App] startCareManagementChat 응답:', response);
      
      if (response.success) {
        console.log('[App] 케어 관리 상담 시작 성공, CareChatScreen으로 이동');
        setSelectedPetId(targetPetId);
        setCareConversationId(null); // 새 대화는 conversationId가 없음
        setCurrentScreen('careChat');
      } else {
        console.warn('[App] startCareManagementChat 응답 실패:', response.message);
        Alert.alert('오류', response.message || '케어 관리 상담을 시작할 수 없습니다.');
      }
    } catch (error: any) {
      console.error('[App] 케어 관리 상담 시작 실패:', error);
      console.error('[App] 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // 에러가 발생해도 화면은 이동 (에러는 CareChatScreen에서 처리)
      console.log('[App] 에러 발생했지만 CareChatScreen으로 이동');
      setSelectedPetId(targetPetId);
      setCareConversationId(null);
      setCurrentScreen('careChat');
    }
  };

  // 케어 관리 대화 화면에서 뒤로가기
  const handleCareChatBack = () => {
    console.log('[App] handleCareChatBack 호출됨');
    setCareConversationId(null);
    console.log('[App] homeInitialTab을 chatbot으로 설정');
    setHomeInitialTab('chatbot'); // chatbot 탭 활성화
    console.log('[App] currentScreen을 home으로 설정');
    setCurrentScreen('home');
    console.log('[App] BotHome(상담하기 화면)으로 이동 완료');
  };

  // 케어 관리 대화 화면에서 보관함으로 이동
  const handleCareChatToInbox = () => {
    setCareConversationId(null);
    setCurrentScreen('careInbox');
  };

  // 케어 관리 보관함으로 이동
  const handleNavigateToCareInbox = async () => {
    // 기본 반려동물 가져오기
    let targetPetId = selectedPetId;
    
    if (!targetPetId) {
      try {
        const petsResponse = await getPets();
        if (petsResponse.success && petsResponse.data && petsResponse.data.length > 0) {
          const primaryPet = petsResponse.data.find((p) => p.isPrimary) || petsResponse.data[0];
          targetPetId = Number(primaryPet.petId);
        } else {
          Alert.alert('알림', '반려동물을 먼저 등록해주세요.');
          return;
        }
      } catch (error: any) {
        console.error('반려동물 목록 조회 실패:', error);
        Alert.alert('오류', '반려동물 정보를 불러오는데 실패했습니다.');
        return;
      }
    }

    if (!targetPetId) {
      return;
    }

    setSelectedPetId(targetPetId);
    setCurrentScreen('careInbox');
  };

  // 케어 관리 보관함 화면에서 뒤로가기
  const handleCareInboxBack = () => {
    setCurrentScreen('home');
  };

  // 케어 관리 보관함에서 대화 상세 보기
  const handleCareInboxToDetail = (conversationId: number) => {
    setCareConversationId(conversationId);
    setCurrentScreen('careArchiveDetail');
  };

  // 케어 관리 보관함 상세에서 뒤로가기
  const handleCareArchiveDetailBack = () => {
    setCurrentScreen('careInbox');
  };

  // 커뮤니티 화면으로 이동
  const handleNavigateToCommunity = () => {
    setCurrentScreen('community');
  };

  // 커뮤니티에서 뒤로가기
  const handleCommunityBack = () => {
    setHomeInitialTab('community');
    setCurrentScreen('home');
  };

  // 게시글 작성 화면으로 이동
  const handleNavigateToPostWrite = (boardType: BoardType) => {
    setPostBoardType(boardType);
    setCurrentScreen('postWrite');
  };

  // 게시글 작성 화면에서 뒤로가기
  const handlePostWriteBack = () => {
    setCurrentScreen('community');
  };

  // 게시글 작성 완료 후 상세 화면으로 이동
  const handlePostCreated = (postId: number) => {
    setSelectedPostId(postId);
    setCurrentScreen('postDetail');
  };

  // 게시글 상세 화면으로 이동
  const handleNavigateToPostDetail = (postId: number) => {
    setSelectedPostId(postId);
    setCurrentScreen('postDetail');
  };

  // 게시글 상세 화면에서 뒤로가기
  const handlePostDetailBack = () => {
    setSelectedPostId(null);
    setCurrentScreen('community');
  };

  // 픽업 카테고리 선택 -> 약품 리스트로 이동
  const handleNavigateToPickupProductList = (categoryId: string) => {
    setSelectedPickupCategoryId(categoryId);
    setCurrentScreen('pickupProductList');
  };

  // 픽업 약품 리스트에서 뒤로가기
  const handlePickupProductListBack = () => {
    setCurrentScreen('home');
    setHomeInitialTab('journal');
  };

  // 픽업 약국 선택으로 이동
  const handleNavigateToPickupPharmacySelect = (products: Array<{product: PickupProduct; quantity: number}>) => {
    setSelectedPickupProducts(products);
    setCurrentScreen('pickupPharmacySelect');
  };

  // 픽업 약국 선택에서 뒤로가기
  const handlePickupPharmacySelectBack = () => {
    setCurrentScreen('pickupProductList');
  };

  // 픽업 약국 선택 시 요청 확인 페이지로 이동 (PICK-11)
  const handleNavigateToPickupRequestConfirm = (pharmacy: DummyPharmacy) => {
    setSelectedPharmacy(pharmacy);
    setCurrentScreen('pickupRequestConfirm');
  };

  // 픽업 요청 확인에서 뒤로가기
  const handlePickupRequestConfirmBack = () => {
    setCurrentScreen('pickupPharmacySelect');
  };

  // 픽업 요청 제출 완료 후 상태 확인 페이지로 이동 (PICK-15)
  const handlePickupRequestConfirmed = () => {
    setCurrentScreen('pickupStatus');
  };

  // 픽업 상태 확인에서 홈으로 돌아가기
  const handlePickupStatusClose = () => {
    setSelectedPickupProducts([]);
    setSelectedPickupCategoryId(null);
    setSelectedPharmacy(null);
    setCurrentScreen('home');
    setHomeInitialTab('journal');
  };

  // 픽업 히스토리 화면으로 이동
  const handleNavigateToPickupHistory = () => {
    setCurrentScreen('pickupHistory');
  };

  // 픽업 히스토리에서 뒤로가기
  const handlePickupHistoryBack = () => {
    setCurrentScreen('home');
    setHomeInitialTab('journal');
  };

  // 픽업 내역 상세로 이동 (PICK-19)
  const handleNavigateToPickupDetail = (requestId: string) => {
    setSelectedPickupRequestId(requestId);
    setCurrentScreen('pickupDetail');
  };

  // 픽업 상세에서 뒤로가기
  const handlePickupDetailBack = () => {
    setCurrentScreen('pickupHistory');
  };

  // 픽업 예약 완료 (기존 호환성 유지)
  const handleConfirmPickup = (pharmacyId: string) => {
    Alert.alert(
      '픽업 예약 완료',
      '약국에서 픽업 준비가 완료되면 알림을 보내드립니다.',
      [
        {
          text: '확인',
          onPress: () => {
            setSelectedPickupProducts([]);
            setSelectedPickupCategoryId(null);
            setCurrentScreen('home');
            setHomeInitialTab('journal');
          },
        },
      ]
    );
  };

  // 장소 상세 화면으로 이동
  const handleNavigateToPlaceDetail = (type: 'pharmacy' | 'hospital', place: VeterinaryPharmacy | VeterinaryHospital) => {
    setSelectedPlace({ type, place });
    setCurrentScreen('placeDetail');
  };

  // 장소 상세에서 뒤로가기
  const handlePlaceDetailBack = () => {
    setSelectedPlace(null);
    setCurrentScreen('home');
  };

  // 리뷰 작성 화면으로 이동
  const handleNavigateToReviewWrite = (type: 'pharmacy' | 'hospital', placeId: number, placeName: string) => {
    setReviewWriteParams({ type, placeId, placeName });
    setCurrentScreen('reviewWrite');
  };

  // 리뷰 수정 화면으로 이동
  const handleNavigateToReviewEdit = (type: 'pharmacy' | 'hospital', placeId: number, placeName: string, reviewId: number) => {
    setReviewWriteParams({ type, placeId, placeName, reviewId });
    setCurrentScreen('reviewEdit');
  };

  // 리뷰 작성/수정에서 뒤로가기
  const handleReviewWriteBack = () => {
    setReviewWriteParams(null);
    if (selectedPlace) {
      setCurrentScreen('placeDetail');
    } else {
      setCurrentScreen('home');
    }
  };

  // 리뷰 상세 화면으로 이동
  const handleNavigateToReviewDetail = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setCurrentScreen('reviewDetail');
  };

  // 리뷰 상세에서 뒤로가기
  const handleReviewDetailBack = () => {
    setSelectedReviewId(null);
    if (selectedPlace) {
      setCurrentScreen('placeDetail');
    } else {
      setCurrentScreen('home');
    }
  };

  // 인증이 필요한 화면인지 확인
  const requiresAuth = currentScreen !== 'login' && currentScreen !== 'signup';

  // 인증이 필요한데 userData가 없으면 로그인 화면으로 리다이렉트
  useEffect(() => {
    if (requiresAuth && !userData && !isLoading) {
      console.log('인증이 필요하지만 사용자 정보가 없음. 로그인 화면으로 이동');
      setCurrentScreen('login');
    }
  }, [requiresAuth, userData, isLoading]);

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
      ) : !userData ? (
        // userData가 없으면 로그인 화면으로 (이중 보안)
        <LoginScreen
          onNavigateToSignUp={() => setCurrentScreen('signup')}
          onLoginSuccess={handleLoginSuccess}
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
      ) : currentScreen === 'careChat' && selectedPetId ? (
        <CareChatScreen
          petId={selectedPetId}
          conversationId={careConversationId}
          onNavigateBack={handleCareChatBack}
          onNavigateToInbox={handleCareChatToInbox}
        />
      ) : currentScreen === 'careInbox' && selectedPetId ? (
        <CareInboxScreen
          petId={selectedPetId}
          onNavigateBack={handleCareInboxBack}
          onNavigateToDetail={handleCareInboxToDetail}
        />
      ) : currentScreen === 'careArchiveDetail' && selectedPetId && careConversationId ? (
        <CareArchiveDetailScreen
          petId={selectedPetId}
          conversationId={careConversationId}
          onNavigateBack={handleCareArchiveDetailBack}
        />
      ) : currentScreen === 'community' ? (
        <CommunityScreen
          onNavigateToPostDetail={handleNavigateToPostDetail}
          onNavigateToPostWrite={handleNavigateToPostWrite}
          userData={userData || undefined}
          userLocation={userLocation || undefined}
        />
      ) : currentScreen === 'postWrite' ? (
        <PostWriteScreen
          onNavigateBack={handlePostWriteBack}
          onPostCreated={handlePostCreated}
          boardType={postBoardType}
          userLocation={userLocation || {
            latitude: 37.5665,
            longitude: 126.978,
            locationName: '서울시청'
          }}
        />
      ) : currentScreen === 'postDetail' && selectedPostId ? (
        <PostDetailScreen
          postId={selectedPostId}
          onNavigateBack={handlePostDetailBack}
          userData={userData || undefined}
        />
      ) : currentScreen === 'pickupProductList' && selectedPickupCategoryId ? (
        <PickupProductListScreen
          categoryId={selectedPickupCategoryId}
          onNavigateBack={handlePickupProductListBack}
          onNavigateToPharmacySelect={handleNavigateToPickupPharmacySelect}
        />
      ) : currentScreen === 'pickupPharmacySelect' ? (
        <PickupPharmacySelectScreen
          selectedProducts={selectedPickupProducts}
          onNavigateBack={handlePickupPharmacySelectBack}
          onConfirmPickup={handleConfirmPickup}
          onNavigateToRequestConfirm={handleNavigateToPickupRequestConfirm}
        />
      ) : currentScreen === 'pickupRequestConfirm' && selectedPharmacy ? (
        <PickupRequestConfirmScreen
          selectedProducts={selectedPickupProducts}
          selectedPharmacy={selectedPharmacy}
          onBack={handlePickupRequestConfirmBack}
          onConfirm={handlePickupRequestConfirmed}
        />
      ) : currentScreen === 'pickupStatus' ? (
        <PickupStatusScreen
          onClose={handlePickupStatusClose}
        />
      ) : currentScreen === 'pickupHistory' ? (
        <PickupHistoryScreen
          onBack={handlePickupHistoryBack}
          onNavigateToDetail={handleNavigateToPickupDetail}
        />
      ) : currentScreen === 'pickupDetail' && selectedPickupRequestId ? (
        <PickupStatusScreen
          onClose={handlePickupDetailBack}
        />
      ) : currentScreen === 'placeDetail' && selectedPlace ? (
        <PlaceDetailScreen
          type={selectedPlace.type}
          place={selectedPlace.place}
          onNavigateBack={handlePlaceDetailBack}
          onNavigateToReviewWrite={handleNavigateToReviewWrite}
          onNavigateToReviewDetail={handleNavigateToReviewDetail}
        />
      ) : currentScreen === 'reviewWrite' && reviewWriteParams && !reviewWriteParams.reviewId ? (
        <ReviewWriteScreen
          type={reviewWriteParams.type}
          placeId={reviewWriteParams.placeId}
          placeName={reviewWriteParams.placeName}
          onNavigateBack={handleReviewWriteBack}
        />
      ) : currentScreen === 'reviewEdit' && reviewWriteParams && reviewWriteParams.reviewId ? (
        <ReviewWriteScreen
          type={reviewWriteParams.type}
          placeId={reviewWriteParams.placeId}
          placeName={reviewWriteParams.placeName}
          reviewId={reviewWriteParams.reviewId}
          onNavigateBack={handleReviewWriteBack}
        />
      ) : currentScreen === 'reviewDetail' && selectedReviewId ? (
        <ReviewDetailScreen
          reviewId={selectedReviewId}
          onNavigateBack={handleReviewDetailBack}
          onNavigateToEdit={handleNavigateToReviewEdit}
        />
      ) : (
        <HomeScreen
          key={homeInitialTab || 'default'} // key를 추가하여 initialTab 변경 시 재렌더링 강제
          userData={userData}
          onLogout={handleLogout}
          onNavigateToPetProfile={handleNavigateToPetList}
          onNavigateToHealthCheck={handleNavigateToHealthCheckForm}
          onNavigateToCareChat={handleNavigateToCareChat}
          onNavigateToCareInbox={handleNavigateToCareInbox}
          onNavigateToCommunity={handleNavigateToCommunity}
          onNavigateToPostDetail={handleNavigateToPostDetail}
          onNavigateToPostWrite={handleNavigateToPostWrite}
          onNavigateToPickupCategory={handleNavigateToPickupProductList}
          onNavigateToPickupHistory={handleNavigateToPickupHistory}
          onNavigateToPlaceDetail={handleNavigateToPlaceDetail}
          initialTab={homeInitialTab}
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
