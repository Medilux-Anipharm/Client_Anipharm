/**
 * Health Chatbot Service
 * 건강 상태 체크 및 케어 관리 챗봇 관련 API 호출 함수들
 */

import apiClient from './api';
import { API_CONFIG } from '../config/api';

export interface HealthCheckData {
  concernType: string[];
  appetite: '정상' | '감소' | '거의 안 먹음' | '증가';
  activity: '정상' | '감소' | '매우 무기력' | '과도하게 활동적';
  temperature: '정상(37.5~39.2)' | '낮음(≤37)' | '높음(≥39.5)' | '미측정';
  note?: string;
}

export interface StartHealthStatusChatRequest {
  petId: number;
  healthCheckData: HealthCheckData;
}

export interface StartHealthStatusChatResponse {
  success: boolean;
  message: string;
  data: {
    healthCheckId: number;
  };
}

export interface SendMessageRequest {
  petId: number;
  conversationType: 'health_status' | 'care_management';
  healthCheckId?: number | null;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    parsed?: any;
  };
}

export interface HealthAssessment {
  triage_level: 'BLUE' | 'GREEN' | 'AMBER' | 'RED';
  recommended_actions: string[];
  health_check_summary: string;
}

export interface GenerateHealthAssessmentRequest {
  petId: number;
  healthCheckId: number;
}

export interface GenerateHealthAssessmentResponse {
  success: boolean;
  message: string;
  data: HealthAssessment;
}

export interface EndConversationRequest {
  petId: number;
  conversationType: 'health_status' | 'care_management';
  healthCheckId?: number | null;
  saveReport?: boolean;
}

export interface EndConversationResponse {
  success: boolean;
  message: string;
  data: {
    summary: string;
  };
}

export interface ConversationScriptResponse {
  success: boolean;
  message: string;
  data: {
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      messageOrder: number;
    }>;
  };
}

/**
 * 건강 상태 상담 시작 (자가검진 필수)
 */
export const startHealthStatusChat = async (
  data: StartHealthStatusChatRequest
): Promise<StartHealthStatusChatResponse> => {
  const response = await apiClient.post<StartHealthStatusChatResponse>(
    API_CONFIG.ENDPOINTS.CHATBOT.HEALTH_START,
    data
  );
  return response.data;
};

/**
 * 케어 관리 상담 시작 (자가검진 없음)
 */
export const startCareManagementChat = async (
  petId: number
): Promise<StartHealthStatusChatResponse> => {
  const response = await apiClient.post<StartHealthStatusChatResponse>(
    API_CONFIG.ENDPOINTS.CHATBOT.CARE_START,
    { petId }
  );
  return response.data;
};

/**
 * 챗봇 메시지 전송
 */
export const sendMessage = async (
  data: SendMessageRequest
): Promise<SendMessageResponse> => {
  // health_status일 때 healthCheckId 필수 확인
  if (data.conversationType === 'health_status' && !data.healthCheckId) {
    throw new Error('건강상태 상담은 healthCheckId가 필수입니다.');
  }

  const response = await apiClient.post<SendMessageResponse>(
    API_CONFIG.ENDPOINTS.CHATBOT.MESSAGE,
    data
  );
  return response.data;
};

/**
 * 건강 평가 생성 (건강상태 상담 전용)
 */
export const generateHealthAssessment = async (
  data: GenerateHealthAssessmentRequest
): Promise<GenerateHealthAssessmentResponse> => {
  const response = await apiClient.post<GenerateHealthAssessmentResponse>(
    API_CONFIG.ENDPOINTS.CHATBOT.HEALTH_ASSESS,
    data
  );
  return response.data;
};

/**
 * 대화 종료 및 리포트 저장
 */
export const endConversation = async (
  data: EndConversationRequest
): Promise<EndConversationResponse> => {
  const response = await apiClient.post<EndConversationResponse>(
    API_CONFIG.ENDPOINTS.CHATBOT.CONVERSATION_END,
    data
  );
  return response.data;
};

/**
 * 대화 스크립트 조회
 */
export const getConversationScript = async (
  petId: number,
  conversationType: 'health_status' | 'care_management',
  healthCheckId?: number | null
): Promise<ConversationScriptResponse> => {
  const params = new URLSearchParams({
    petId: petId.toString(),
    conversationType,
  });
  if (healthCheckId) {
    params.append('healthCheckId', healthCheckId.toString());
  }
  
  const response = await apiClient.get<ConversationScriptResponse>(
    `${API_CONFIG.ENDPOINTS.CHATBOT.CONVERSATION_SCRIPT}?${params.toString()}`
  );
  return response.data;
};

