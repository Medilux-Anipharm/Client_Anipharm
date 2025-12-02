/**
 * Map Service
 * 지도 관련 API 호출 서비스
 */

import apiClient from './api.service';
import { GeocodeResult, Place, MapCategory, SearchOptions } from '../types/map.types';

class MapService {
  /**
   * 주소를 좌표로 변환 (Geocoding)
   * @param address - 변환할 주소
   * @returns 좌표 정보
   */
  async geocode(address: string): Promise<GeocodeResult> {
    try {
      const response = await apiClient.get<GeocodeResult>('/map/geocode', {
        params: { address },
      });
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || '주소 변환 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 카테고리별 장소 검색
   * @param category - 검색할 카테고리
   * @param options - 검색 옵션 (지역, 좌표, 표시 개수 등)
   * @returns 검색된 장소 목록
   */
  async searchByCategory(
    category: MapCategory,
    options?: SearchOptions
  ): Promise<Place[]> {
    try {
      const params: any = { category };
      
      if (options?.region) params.region = options.region;
      if (options?.latitude) params.latitude = options.latitude.toString();
      if (options?.longitude) params.longitude = options.longitude.toString();
      if (options?.display) params.display = options.display.toString();
      if (options?.start) params.start = options.start.toString();

      const response = await apiClient.get<Place[]>('/map/search', { params });
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || '장소 검색 중 오류가 발생했습니다.'
      );
    }
  }
}

export default new MapService();

