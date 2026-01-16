/**
 * Pharmacy Service
 * 동물약국 관련 API 호출 서비스
 */

import apiClient from './api';
import {
  VeterinaryPharmacy,
  PharmacyMarker,
  NearbyPharmaciesResponse,
  PharmacyMarkersResponse,
} from '../types/pharmacy';

class PharmacyService {
  /**
   * 주변 동물약국 검색
   * @param latitude - 위도
   * @param longitude - 경도
   * @param radius - 반경 (km, 기본값: 5)
   * @returns 주변 동물약국 목록
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radius: number = 5
  ): Promise<VeterinaryPharmacy[]> {
    try {
      const response = await apiClient.get<NearbyPharmaciesResponse>(
        '/pharmacies/nearby',
        {
          params: {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            radius: radius.toString(),
          },
        }
      );
      console.log('주변 약국 데이터:', response.data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '주변 약국 검색 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 키워드로 동물약국 검색
   * @param keyword - 검색 키워드 (약국명 또는 주소)
   * @param limit - 결과 개수 제한 (기본값: 20)
   * @returns 검색된 동물약국 목록
   */
  async searchByKeyword(
    keyword: string,
    limit: number = 20
  ): Promise<VeterinaryPharmacy[]> {
    try {
      const response = await apiClient.get<NearbyPharmaciesResponse>(
        '/pharmacies/search',
        {
          params: {
            keyword,
            limit: limit.toString(),
          },
        }
      );
      console.log('약국 검색 데이터:', response.data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '약국 검색 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 지도 마커 데이터 조회
   * @param latitude - 위도
   * @param longitude - 경도
   * @param radius - 반경 (km, 기본값: 5)
   * @returns 지도 마커 데이터
   */
  async getMapMarkers(
    latitude: number,
    longitude: number,
    radius: number = 8
  ): Promise<PharmacyMarker[]> {
    try {
      const response = await apiClient.get<PharmacyMarkersResponse>(
        '/pharmacies/markers',
        {
          params: {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            radius: radius.toString(),
          },
        }
      );
      console.log('지도 마커 데이터:', response.data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '마커 데이터 조회 중 오류가 발생했습니다.'
      );
    }
  }
}

export default new PharmacyService();

