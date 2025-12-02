/**
 * Hospital Service
 * 동물병원 관련 API 호출 서비스
 */

import apiClient from './api.service';
import {
  VeterinaryHospital,
  HospitalMarker,
  NearbyHospitalsResponse,
  HospitalDetailResponse,
  HospitalMarkersResponse,
} from '../types/hospital.types';

class HospitalService {
  /**
   * 주변 동물병원 검색
   * @param latitude - 위도
   * @param longitude - 경도
   * @param radius - 반경 (km, 기본값: 5)
   * @returns 주변 동물병원 목록
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radius: number = 5
  ): Promise<VeterinaryHospital[]> {
    try {
      const response = await apiClient.get<NearbyHospitalsResponse>(
        '/hospitals/nearby',
        {
          params: {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            radius: radius.toString(),
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '주변 병원 검색 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 키워드로 동물병원 검색
   * @param keyword - 검색 키워드
   * @param limit - 결과 개수 제한 (기본값: 20)
   * @returns 검색된 동물병원 목록
   */
  async searchByKeyword(
    keyword: string,
    limit: number = 20
  ): Promise<VeterinaryHospital[]> {
    try {
      const response = await apiClient.get('/hospitals/search', {
        params: {
          keyword,
          limit: limit.toString(),
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '병원 검색 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 동물병원 상세 정보 조회
   * @param hospitalId - 병원 ID
   * @returns 동물병원 상세 정보
   */
  async getDetail(hospitalId: number): Promise<VeterinaryHospital> {
    try {
      const response = await apiClient.get<HospitalDetailResponse>(
        `/hospitals/${hospitalId}`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '병원 정보 조회 중 오류가 발생했습니다.'
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
    radius: number = 5
  ): Promise<HospitalMarker[]> {
    try {
      const response = await apiClient.get<HospitalMarkersResponse>(
        '/hospitals/markers',
        {
          params: {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            radius: radius.toString(),
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '마커 데이터 조회 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 24시간 운영 병원 조회
   * @returns 24시간 운영 병원 목록
   */
  async get24HourHospitals(): Promise<VeterinaryHospital[]> {
    try {
      const response = await apiClient.get('/hospitals/24hour');
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '24시간 병원 조회 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 평점 높은 병원 조회
   * @param limit - 결과 개수 제한 (기본값: 10)
   * @returns 평점 높은 병원 목록
   */
  async getTopRated(limit: number = 10): Promise<VeterinaryHospital[]> {
    try {
      const response = await apiClient.get('/hospitals/top-rated', {
        params: {
          limit: limit.toString(),
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '평점 높은 병원 조회 중 오류가 발생했습니다.'
      );
    }
  }
}

export default new HospitalService();

