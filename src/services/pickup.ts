/**
 * Pickup Service
 * 픽업 요청 관련 API 서비스
 */

import apiClient from './api';
import { API_CONFIG } from '../config/api';
import {
  PickupRequest,
  PickupStats,
  CreatePickupRequestData,
  UpdatePickupStatusData,
} from '../types/pickup';

class PickupService {
  // ==========================================
  // 고객용 API
  // ==========================================

  /**
   * 픽업 요청 생성
   */
  async createPickupRequest(data: CreatePickupRequestData): Promise<PickupRequest> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: PickupRequest;
        message: string;
      }>(API_CONFIG.ENDPOINTS.PICKUP.CREATE, data);

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || '픽업 요청 생성에 실패했습니다.'
      );
    }
  }

  /**
   * 내 픽업 요청 목록 조회
   */
  async getMyPickupRequests(status?: string): Promise<PickupRequest[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: PickupRequest[];
        count: number;
      }>(API_CONFIG.ENDPOINTS.PICKUP.MY_REQUESTS, {
        params: status ? { status } : {},
      });

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || '픽업 요청 목록 조회에 실패했습니다.'
      );
    }
  }

  /**
   * 픽업 요청 상세 조회
   */
  async getPickupRequestDetail(pickupId: number): Promise<PickupRequest> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: PickupRequest;
      }>(API_CONFIG.ENDPOINTS.PICKUP.DETAIL(pickupId));

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || '픽업 요청 조회에 실패했습니다.'
      );
    }
  }

  /**
   * 픽업 취소 (고객)
   */
  async cancelPickupRequest(
    pickupId: number,
    cancelReason?: string
  ): Promise<PickupRequest> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: PickupRequest;
        message: string;
      }>(API_CONFIG.ENDPOINTS.PICKUP.CANCEL(pickupId), {
        cancelReason,
      });

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || '픽업 취소에 실패했습니다.'
      );
    }
  }

  // ==========================================
  // 약국용 API
  // ==========================================

  /**
   * 약국의 픽업 요청 목록 조회
   */
  async getPharmacyPickupRequests(status?: string): Promise<{
    data: PickupRequest[];
    count: number;
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: PickupRequest[];
        count: number;
      }>(API_CONFIG.ENDPOINTS.PICKUP.PHARMACY_REQUESTS, {
        params: status ? { status } : {},
      });

      return {
        data: response.data.data,
        count: response.data.count,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || '픽업 요청 목록 조회에 실패했습니다.'
      );
    }
  }

  /**
   * 약국 통계 조회
   */
  async getPharmacyStats(): Promise<PickupStats> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: PickupStats;
      }>(API_CONFIG.ENDPOINTS.PICKUP.PHARMACY_STATS);

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || '통계 조회에 실패했습니다.'
      );
    }
  }

  /**
   * 픽업 상태 업데이트 (약국)
   */
  async updatePickupStatus(
    pickupId: number,
    data: UpdatePickupStatusData
  ): Promise<PickupRequest> {
    try {
      console.log('========================================');
      console.log('[PickupService] 상태 업데이트 시작');
      console.log('[PickupService] pickupId:', pickupId);
      console.log('[PickupService] data:', JSON.stringify(data, null, 2));
      
      // 약국 토큰 가져오기
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const pharmacyToken = await AsyncStorage.getItem('authToken');
      if (!pharmacyToken) {
        console.error('[PickupService] 약국 토큰이 없습니다!');
        throw new Error('약국 인증 토큰이 필요합니다.');
      }

      console.log('[PickupService] 약국 토큰 확인:', pharmacyToken ? `토큰 있음 (길이: ${pharmacyToken.length}, 앞 20자: ${pharmacyToken.substring(0, 20)}...)` : '토큰 없음');
      
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PICKUP.PHARMACY_UPDATE_STATUS(pickupId)}`;
      console.log('[PickupService] API 엔드포인트:', API_CONFIG.ENDPOINTS.PICKUP.PHARMACY_UPDATE_STATUS(pickupId));
      console.log('[PickupService] BASE_URL:', API_CONFIG.BASE_URL);
      console.log('[PickupService] 최종 API URL:', apiUrl);
      console.log('[PickupService] 요청 메서드: PUT');
      console.log('[PickupService] 요청 데이터:', JSON.stringify(data, null, 2));

      const axios = require('axios');
      const response = await axios.put<{
        success: boolean;
        data: PickupRequest;
        message: string;
      }>(
        apiUrl,
        data,
        {
          headers: {
            'Authorization': `Bearer ${pharmacyToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[PickupService] HTTP 응답 받음');
      console.log('[PickupService] 응답 상태:', response.status);
      console.log('[PickupService] 응답 데이터:', JSON.stringify(response.data, null, 2));
      console.log('[PickupService] 상태 업데이트 성공');
      console.log('========================================');
      
      return response.data.data;
    } catch (error: any) {
      console.error('========================================');
      console.error('[PickupService] 상태 업데이트 실패');
      console.error('[PickupService] 에러 타입:', error?.constructor?.name);
      console.error('[PickupService] 에러 메시지:', error?.message);
      
      if (error?.response) {
        console.error('[PickupService] 응답 상태:', error.response.status);
        console.error('[PickupService] 응답 데이터:', JSON.stringify(error.response.data, null, 2));
      }
      console.error('========================================');
      
      throw new Error(
        error.response?.data?.message || '상태 업데이트에 실패했습니다.'
      );
    }
  }

  /**
   * 픽업 완료 처리 (약국)
   */
  async completePickup(pickupId: number): Promise<PickupRequest> {
    try {
      console.log('[PickupService] 픽업 완료 처리 시작. pickupId:', pickupId);

      // 약국 토큰 가져오기
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const pharmacyToken = await AsyncStorage.getItem('authToken');
      if (!pharmacyToken) {
        console.error('[PickupService] 약국 토큰이 없습니다!');
        throw new Error('약국 인증 토큰이 필요합니다.');
      }

      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PICKUP.PHARMACY_COMPLETE(pickupId)}`;
      console.log('[PickupService] API URL:', apiUrl);

      const axios = require('axios');
      const response = await axios.put<{
        success: boolean;
        data: PickupRequest;
        message: string;
      }>(
        apiUrl,
        {},
        {
          headers: {
            'Authorization': `Bearer ${pharmacyToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[PickupService] 픽업 완료 처리 성공');
      return response.data.data;
    } catch (error: any) {
      console.error('[PickupService] 픽업 완료 처리 실패:', error.message);
      throw new Error(
        error.response?.data?.message || '픽업 완료 처리에 실패했습니다.'
      );
    }
  }

  /**
   * 픽업 취소 (약국)
   */
  async cancelPickupByPharmacy(
    pickupId: number,
    cancelReason: string
  ): Promise<PickupRequest> {
    try {
      console.log('[PickupService] 약국 픽업 취소 시작. pickupId:', pickupId);

      // 약국 토큰 가져오기
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const pharmacyToken = await AsyncStorage.getItem('authToken');
      if (!pharmacyToken) {
        console.error('[PickupService] 약국 토큰이 없습니다!');
        throw new Error('약국 인증 토큰이 필요합니다.');
      }

      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PICKUP.PHARMACY_CANCEL(pickupId)}`;
      console.log('[PickupService] API URL:', apiUrl);

      const axios = require('axios');
      const response = await axios.put<{
        success: boolean;
        data: PickupRequest;
        message: string;
      }>(
        apiUrl,
        { cancelReason },
        {
          headers: {
            'Authorization': `Bearer ${pharmacyToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[PickupService] 약국 픽업 취소 성공');
      return response.data.data;
    } catch (error: any) {
      console.error('[PickupService] 약국 픽업 취소 실패:', error.message);
      throw new Error(
        error.response?.data?.message || '픽업 취소에 실패했습니다.'
      );
    }
  }

  // ==========================================
  // 유틸리티 함수
  // ==========================================

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      REQUESTED: '요청됨',
      REJECTED: '거절됨',
      WAITING: '재고 대기',
      ACCEPTED: '수락됨',
      PREPARING: '준비 중',
      READY: '픽업 대기',
      COMPLETED: '픽업 완료',
      CANCELED: '취소됨',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      REQUESTED: '#2196F3',
      REJECTED: '#F44336',
      WAITING: '#FF9800',
      ACCEPTED: '#4CAF50',
      PREPARING: '#9C27B0',
      READY: '#00BCD4',
      COMPLETED: '#4CAF50',
      CANCELED: '#9E9E9E',
    };
    return colorMap[status] || '#666666';
  }

  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      REQUESTED: 'time-outline',
      REJECTED: 'close-circle-outline',
      WAITING: 'hourglass-outline',
      ACCEPTED: 'checkmark-circle-outline',
      PREPARING: 'build-outline',
      READY: 'checkmark-done-outline',
      COMPLETED: 'checkmark-done-circle',
      CANCELED: 'ban-outline',
    };
    return iconMap[status] || 'help-circle-outline';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  getRelativeTime(dateString?: string): string {
    if (!dateString) return '-';

    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return this.formatDate(dateString);
  }

  canPickup(status: string): boolean {
    return status === 'READY';
  }

  canCancel(status: string): boolean {
    return ['REQUESTED', 'ACCEPTED', 'WAITING'].includes(status);
  }
}

export default new PickupService();
