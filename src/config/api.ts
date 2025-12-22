/**
 * API Configuration
 * 백엔드 서버의 기본 URL 및 API 설정
 */

// 환경에 따라 API URL을 설정합니다
// 개발 환경에서는 로컬 서버를 사용합니다
// 주의: 웹 환경과 앱(iOS/Android) 모두에서 실제 IP 주소를 사용해야 합니다
const API_BASE_URL = __DEV__
  ? "http://localhost:3000/api" // 개발 환경 (웹/앱 모두에서 작동) http://localhost:3000/api / http://192.168.0.57:3000/api
  : "https://your-production-api.com/api";  // 프로덕션 환경

// API 타임아웃 설정 (밀리초)
const API_TIMEOUT = 10000;

// Naver 지도 API 클라이언트 ID
// 네이버 클라우드 플랫폼에서 발급받은 지도 API 클라이언트 ID를 입력하세요
// .env 파일의 EXPO_PUBLIC_NAVER_MAP_CLIENT_ID 또는 NAVER_GEOCODE_CLIENT_ID 사용
export const NAVER_MAP_CLIENT_ID = 
  process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID || 
  process.env.NAVER_GEOCODE_CLIENT_ID || 
  'YOUR_NAVER_MAP_CLIENT_ID';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,
  ENDPOINTS: {
    // Auth 관련 엔드포인트
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      CHECK_EMAIL: '/auth/check-email',
      CHECK_NICKNAME: '/auth/check-nickname',
      // 소셜 로그인
      SOCIAL_KAKAO: '/auth/social/kakao',
      SOCIAL_NAVER: '/auth/social/naver',
    },
    // User 관련 엔드포인트
    USER: {
      PROFILE: '/users/profile',
      UPDATE: '/users/update',
    },
    // Pet 관련 엔드포인트
    PETS: {
      LIST: '/pets',
      CREATE: '/pets',
      DETAIL: (id: number) => `/pets/${id}`,
    },
    // Map 관련 엔드포인트
    MAP: {
      GEOCODE: '/map/geocode',
      SEARCH: '/map/search',
      LOCATION: '/map/location',
    },
    // Hospital 관련 엔드포인트
    HOSPITALS: {
      NEARBY: '/hospitals/nearby',
      SEARCH: '/hospitals/search',
      MARKERS: '/hospitals/markers',
      DETAIL: (id: number) => `/hospitals/${id}`,
      HOUR_24: '/hospitals/24hour',
      TOP_RATED: '/hospitals/top-rated',
    },
    // Pharmacy 관련 엔드포인트
    PHARMACIES: {
      NEARBY: '/pharmacies/nearby',
      MARKERS: '/pharmacies/markers',
    },
    //챗봇 관련 엔드 포인트
    CHATBOT : {
      //건강 상담 시작
      HEALTHSTART: '/chatbot/health/start',
      // 케어관리 시작
      CARESTART : '/chatbot/care/start',
      // 챗봇 메세지 보내기
      MESSAGE : '/chatbot/message',
      // 결과 평가
      ASSESS : '/chatbot/assess',
      // 대화 스크립트 조회
      SCRIPT : 'chatbot/conversation/script',
      // 대화종료
      END : '/chatbot/conversation/end'

    }
  }
};
