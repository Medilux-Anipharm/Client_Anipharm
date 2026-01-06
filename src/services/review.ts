/**
 * Review Service
 * 리뷰 관련 API 호출 서비스
 */

import apiClient from './api';
import {
  Review,
  ReviewSummary,
  ReviewListResponse,
  ReviewListOptions,
  CreateReviewData,
} from '../types/review';

class ReviewService {
  /**
   * 약국 리뷰 목록 조회
   * @param pharmacyId - 약국 ID
   * @param options - 조회 옵션
   * @returns 리뷰 목록 및 페이지네이션 정보
   */
  async getPharmacyReviews(
    pharmacyId: number,
    options: ReviewListOptions = {}
  ): Promise<ReviewListResponse> {
    try {
      const params = new URLSearchParams();
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.minRating) params.append('minRating', options.minRating.toString());
      if (options.keyword) params.append('keyword', options.keyword);

      const response = await apiClient.get<{ success: boolean; data: ReviewListResponse }>(
        `/reviews/pharmacies/${pharmacyId}?${params.toString()}`
      );
      console.log(`[getPharmacyReviews] 응답 데이터:`, JSON.stringify(response.data, null, 2));
      const reviews = response.data.data.reviews;
      console.log(`[getPharmacyReviews] 리뷰 수: ${reviews.length}`);
      reviews.forEach((review, index) => {
        console.log(`[getPharmacyReviews] 리뷰 ${index + 1} - reviewId: ${review.reviewId}, 미디어 수: ${review.media?.length || 0}`);
        if (review.media && review.media.length > 0) {
          review.media.forEach((media, mIndex) => {
            console.log(`[getPharmacyReviews] 미디어 ${mIndex + 1} - mediaId: ${media.mediaId}, URL: ${media.mediaUrl}, type: ${media.mediaType}`);
          });
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '리뷰 목록 조회 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 병원 리뷰 목록 조회
   * @param hospitalId - 병원 ID
   * @param options - 조회 옵션
   * @returns 리뷰 목록 및 페이지네이션 정보
   */
  async getHospitalReviews(
    hospitalId: number,
    options: ReviewListOptions = {}
  ): Promise<ReviewListResponse> {
    try {
      const params = new URLSearchParams();
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.minRating) params.append('minRating', options.minRating.toString());
      if (options.keyword) params.append('keyword', options.keyword);

      const response = await apiClient.get<{ success: boolean; data: ReviewListResponse }>(
        `/reviews/hospitals/${hospitalId}?${params.toString()}`
      );
      console.log(`[getHospitalReviews] 응답 데이터:`, JSON.stringify(response.data, null, 2));
      const reviews = response.data.data.reviews;
      console.log(`[getHospitalReviews] 리뷰 수: ${reviews.length}`);
      reviews.forEach((review, index) => {
        console.log(`[getHospitalReviews] 리뷰 ${index + 1} - reviewId: ${review.reviewId}, 미디어 수: ${review.media?.length || 0}`);
        if (review.media && review.media.length > 0) {
          review.media.forEach((media, mIndex) => {
            console.log(`[getHospitalReviews] 미디어 ${mIndex + 1} - mediaId: ${media.mediaId}, URL: ${media.mediaUrl}, type: ${media.mediaType}`);
          });
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '리뷰 목록 조회 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 약국 리뷰 요약 조회
   * @param pharmacyId - 약국 ID
   * @returns 리뷰 요약 정보
   */
  async getPharmacyReviewSummary(pharmacyId: number): Promise<ReviewSummary> {
    try {
      console.log(`[getPharmacyReviewSummary] 요청 시작 - pharmacyId: ${pharmacyId}`);
      const response = await apiClient.get<{ success: boolean; data: ReviewSummary }>(
        `/reviews/pharmacies/${pharmacyId}/summary`
      );
      console.log(`[getPharmacyReviewSummary] 응답 성공:`, JSON.stringify(response.data));
      return response.data.data;
    } catch (error: any) {
      console.error(`[getPharmacyReviewSummary] 에러 발생 - pharmacyId: ${pharmacyId}`);
      console.error(`[getPharmacyReviewSummary] 에러 타입:`, error.constructor.name);
      console.error(`[getPharmacyReviewSummary] 에러 메시지:`, error.message);
      console.error(`[getPharmacyReviewSummary] 응답 상태:`, error.response?.status);
      console.error(`[getPharmacyReviewSummary] 응답 데이터:`, error.response?.data);
      console.error(`[getPharmacyReviewSummary] 요청 URL:`, error.config?.url);
      console.error(`[getPharmacyReviewSummary] 전체 에러 객체:`, error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '리뷰 요약 조회 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 병원 리뷰 요약 조회
   * @param hospitalId - 병원 ID
   * @returns 리뷰 요약 정보
   */
  async getHospitalReviewSummary(hospitalId: number): Promise<ReviewSummary> {
    try {
      console.log(`[getHospitalReviewSummary] 요청 시작 - hospitalId: ${hospitalId}`);
      const response = await apiClient.get<{ success: boolean; data: ReviewSummary }>(
        `/reviews/hospitals/${hospitalId}/summary`
      );
      console.log(`[getHospitalReviewSummary] 응답 성공:`, JSON.stringify(response.data));
      return response.data.data;
    } catch (error: any) {
      console.error(`[getHospitalReviewSummary] 에러 발생 - hospitalId: ${hospitalId}`);
      console.error(`[getHospitalReviewSummary] 에러 타입:`, error.constructor.name);
      console.error(`[getHospitalReviewSummary] 에러 메시지:`, error.message);
      console.error(`[getHospitalReviewSummary] 응답 상태:`, error.response?.status);
      console.error(`[getHospitalReviewSummary] 응답 데이터:`, error.response?.data);
      console.error(`[getHospitalReviewSummary] 요청 URL:`, error.config?.url);
      console.error(`[getHospitalReviewSummary] 전체 에러 객체:`, error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '리뷰 요약 조회 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 리뷰 상세 조회
   * @param reviewId - 리뷰 ID
   * @returns 리뷰 상세 정보
   */
  async getReviewDetail(reviewId: number): Promise<Review> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Review }>(
        `/reviews/${reviewId}`
      );
      const review = response.data.data;
      console.log(`[getReviewDetail] 리뷰 상세 - reviewId: ${review.reviewId}, 미디어 수: ${review.media?.length || 0}`);
      if (review.media && review.media.length > 0) {
        review.media.forEach((media, index) => {
          console.log(`[getReviewDetail] 미디어 ${index + 1} - mediaId: ${media.mediaId}, URL: ${media.mediaUrl}, type: ${media.mediaType}`);
        });
      }
      return review;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '리뷰 상세 조회 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 약국 리뷰 작성
   * @param pharmacyId - 약국 ID
   * @param reviewData - 리뷰 데이터
   * @returns 생성된 리뷰
   */
  async createPharmacyReview(
    pharmacyId: number,
    reviewData: CreateReviewData
  ): Promise<Review> {
    try {
      const formData = new FormData();
      formData.append('rating', reviewData.rating.toString());
      formData.append('content', reviewData.content);
      
      if (reviewData.keywords && reviewData.keywords.length > 0) {
        reviewData.keywords.forEach((keyword) => {
          formData.append('keywords', keyword);
        });
      }

      if (reviewData.mediaFiles && reviewData.mediaFiles.length > 0) {
        for (let index = 0; index < reviewData.mediaFiles.length; index++) {
          const file: any = reviewData.mediaFiles[index];
          
          if (file.isWeb) {
            // 웹 환경: File 객체로 변환
            try {
              const response = await fetch(file.uri);
              const blob = await response.blob();
              const webFile = new File([blob], file.name, { type: blob.type || file.type });
              formData.append('mediaFiles', webFile);
            } catch (error) {
              console.error('[웹] 이미지 변환 실패:', error);
              throw new Error('이미지 변환에 실패했습니다.');
            }
          } else {
            // React Native 환경: uri, name, type 형식 사용
            formData.append('mediaFiles', {
              uri: file.uri,
              name: file.name,
              type: file.type,
            } as any);
          }
        }
      }

      const response = await apiClient.post<{ success: boolean; data: Review }>(
        `/reviews/pharmacies/${pharmacyId}`,
        formData
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '리뷰 작성 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 병원 리뷰 작성
   * @param hospitalId - 병원 ID
   * @param reviewData - 리뷰 데이터
   * @returns 생성된 리뷰
   */
  async createHospitalReview(
    hospitalId: number,
    reviewData: CreateReviewData
  ): Promise<Review> {
    try {
      const formData = new FormData();
      formData.append('rating', reviewData.rating.toString());
      formData.append('content', reviewData.content);
      
      if (reviewData.keywords && reviewData.keywords.length > 0) {
        reviewData.keywords.forEach((keyword) => {
          formData.append('keywords', keyword);
        });
      }

      if (reviewData.mediaFiles && reviewData.mediaFiles.length > 0) {
        for (let index = 0; index < reviewData.mediaFiles.length; index++) {
          const file: any = reviewData.mediaFiles[index];
          
          if (file.isWeb) {
            // 웹 환경: File 객체로 변환
            try {
              const response = await fetch(file.uri);
              const blob = await response.blob();
              const webFile = new File([blob], file.name, { type: blob.type || file.type });
              formData.append('mediaFiles', webFile);
            } catch (error) {
              console.error('[웹] 이미지 변환 실패:', error);
              throw new Error('이미지 변환에 실패했습니다.');
            }
          } else {
            // React Native 환경: uri, name, type 형식 사용
            formData.append('mediaFiles', {
              uri: file.uri,
              name: file.name,
              type: file.type,
            } as any);
          }
        }
      }

      const response = await apiClient.post<{ success: boolean; data: Review }>(
        `/reviews/hospitals/${hospitalId}`,
        formData
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '리뷰 작성 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 리뷰 좋아요 추가
   * @param reviewId - 리뷰 ID
   * @returns 좋아요 수
   */
  async addLike(reviewId: number): Promise<{ likeCount: number }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: { likeCount: number } }>(
        `/reviews/${reviewId}/like`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '좋아요 추가 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 리뷰 좋아요 취소
   * @param reviewId - 리뷰 ID
   * @returns 좋아요 수
   */
  async removeLike(reviewId: number): Promise<{ likeCount: number }> {
    try {
      const response = await apiClient.delete<{ success: boolean; data: { likeCount: number } }>(
        `/reviews/${reviewId}/like`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '좋아요 취소 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 리뷰 수정
   * @param reviewId - 리뷰 ID
   * @param reviewData - 수정할 리뷰 데이터
   * @returns 수정된 리뷰
   */
  async updateReview(
    reviewId: number,
    reviewData: CreateReviewData
  ): Promise<Review> {
    try {
      const formData = new FormData();
      
      if (reviewData.rating !== undefined) {
        formData.append('rating', reviewData.rating.toString());
      }
      if (reviewData.content) {
        formData.append('content', reviewData.content);
      }
      
      if (reviewData.keywords && reviewData.keywords.length > 0) {
        reviewData.keywords.forEach((keyword) => {
          formData.append('keywords', keyword);
        });
      }

      if (reviewData.mediaFiles && reviewData.mediaFiles.length > 0) {
        reviewData.mediaFiles.forEach((file: any) => {
          formData.append('mediaFiles', {
            uri: file.uri,
            name: file.name,
            type: file.type,
          } as any);
        });
      }

      const response = await apiClient.put<{ success: boolean; data: Review }>(
        `/reviews/${reviewId}`,
        formData
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '리뷰 수정 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 리뷰 삭제
   * @param reviewId - 리뷰 ID
   */
  async deleteReview(reviewId: number): Promise<void> {
    try {
      await apiClient.delete<{ success: boolean }>(`/reviews/${reviewId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          '리뷰 삭제 중 오류가 발생했습니다.'
      );
    }
  }
}

export default new ReviewService();

