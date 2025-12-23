/**
 * API Configuration
 * 백엔드 서버의 기본 URL 및 API 설정
 */

// 환경에 따라 API URL을 설정합니다
// 개발 환경에서는 로컬 서버를 사용합니다
// 주의: 웹 환경과 앱(iOS/Android) 모두에서 실제 IP 주소를 사용해야 합니다
// 환경 변수 EXPO_PUBLIC_API_BASE_URL이 설정되어 있으면 우선 사용
const API_BASE_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api") // 개발 환경
  : (process.env.EXPO_PUBLIC_API_BASE_URL || "https://your-production-api.com/api");  // 프로덕션 환경

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
      UPDATE: (id: number) => `/pets/${id}`,
      DELETE: (id: number) => `/pets/${id}`,
      SET_PRIMARY: (id: number) => `/pets/${id}/primary`,
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
    // Health Chatbot 관련 엔드포인트
    CHATBOT: {
      HEALTH_START: '/chatbot/health/start',
      CARE_START: '/chatbot/care/start',
      MESSAGE: '/chatbot/message',
      HEALTH_ASSESS: '/chatbot/health/assess',
      CONVERSATION_END: '/chatbot/conversation/end',
      CONVERSATION_SCRIPT: '/chatbot/conversation/script',
      CONVERSATION_LIST: '/chatbot/conversations',
      INBOX_LIST: '/chatbot/inbox',
      DELETE_CONVERSATION: (conversationId: number) => `/chatbot/conversations/${conversationId}`,
    }
  }
};
