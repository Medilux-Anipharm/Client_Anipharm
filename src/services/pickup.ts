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
      const response = await apiClient.put<{
        success: boolean;
        data: PickupRequest;
        message: string;
      }>(API_CONFIG.ENDPOINTS.PICKUP.PHARMACY_UPDATE_STATUS(pickupId), data);

      return response.data.data;
    } catch (error: any) {
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
      const response = await apiClient.put<{
        success: boolean;
        data: PickupRequest;
        message: string;
      }>(API_CONFIG.ENDPOINTS.PICKUP.PHARMACY_COMPLETE(pickupId));

      return response.data.data;
    } catch (error: any) {
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
      const response = await apiClient.put<{
        success: boolean;
        data: PickupRequest;
        message: string;
      }>(API_CONFIG.ENDPOINTS.PICKUP.PHARMACY_CANCEL(pickupId), {
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
