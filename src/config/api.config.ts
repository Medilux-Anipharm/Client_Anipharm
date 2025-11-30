/**
 * API Configuration
 * 백엔드 서버의 기본 URL 및 API 설정
 */

// 환경에 따라 API URL을 설정합니다
// 개발 환경에서는 로컬 서버를 사용합니다
// 주의: 앱(iOS/Android)에서는 localhost 대신 실제 IP 주소를 사용해야 합니다
const API_BASE_URL = __DEV__
  ? 'http://192.168.0.53:3000/api'  // 개발 환경 (앱에서 작동)
  : 'https://your-production-api.com/api';  // 프로덕션 환경

// API 타임아웃 설정 (밀리초)
const API_TIMEOUT = 10000;

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
    }
  }
};
