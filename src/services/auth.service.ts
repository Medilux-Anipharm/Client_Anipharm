/**
 * Auth Service
 * 인증 관련 API 호출 함수들
 */

import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  CheckAvailabilityResponse,
} from '../types/auth.types';

/**
 * 회원가입
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(
    API_CONFIG.ENDPOINTS.AUTH.REGISTER,
    data
  );
  return response.data;
};

/**
 * 로그인
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    API_CONFIG.ENDPOINTS.AUTH.LOGIN,
    data
  );
  console.log('로그인 데이터 확인:',response.data)
  return response.data;
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
};

/**
 * 이메일 중복 확인
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<CheckAvailabilityResponse>(
      `${API_CONFIG.ENDPOINTS.AUTH.CHECK_EMAIL}?email=${email}`
    );
    return response.data.available;
  } catch (error) {
    console.error('이메일 중복 확인 실패:', error);
    return false;
  }
};

/**
 * 닉네임 중복 확인
 */
export const checkNicknameAvailability = async (nickname: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<CheckAvailabilityResponse>(
      `${API_CONFIG.ENDPOINTS.AUTH.CHECK_NICKNAME}?nickname=${nickname}`
    );
    return response.data.available;
  } catch (error) {
    console.error('닉네임 중복 확인 실패:', error);
    return false;
  }
};

// 소셜 로그인은 추후 구현
export const kakaoLogin = async (): Promise<LoginResponse> => {
  // TODO: 카카오 OAuth 로그인 구현
  throw new Error('Not implemented');
};

export const naverLogin = async (): Promise<LoginResponse> => {
  // TODO: 네이버 OAuth 로그인 구현
  throw new Error('Not implemented');
};
