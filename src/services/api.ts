/**
 * API Service
 * Axios 인스턴스 설정 및 공통 API 요청 처리
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api';
import { getToken, clearAuthData } from '../utils/storage';
import eventEmitter from '../utils/eventEmitter';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 토큰 추가
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // FormData인 경우 Content-Type을 제거하여 브라우저가 자동으로 boundary 설정하도록 함
    // React Native와 웹 모두에서 FormData 감지
    if (config.data && (config.data instanceof FormData || (typeof FormData !== 'undefined' && config.data.constructor?.name === 'FormData'))) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      // 서버가 응답을 반환한 경우
      const { status } = error.response;

      switch (status) {
        case 401:
          // 인증 실패 - 토큰 삭제 및 로그아웃 처리
          console.log('인증 실패: 로그인이 필요합니다.');
          await clearAuthData();
          // 크로스 플랫폼 로그아웃 이벤트 발생 (App.tsx에서 처리)
          eventEmitter.emit('auth:logout');
          break;
        case 403:
          // 권한 없음
          console.log('권한이 없습니다.');
          break;
        case 404:
          // 리소스를 찾을 수 없음
          console.log('요청한 리소스를 찾을 수 없습니다.');
          break;
        case 500:
          // 서버 에러
          console.log('서버 오류가 발생했습니다.');
          break;
        default:
          console.log('알 수 없는 오류가 발생했습니다.');
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.log('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
    } else {
      // 요청 설정 중 오류 발생
      console.log('요청 중 오류가 발생했습니다.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
