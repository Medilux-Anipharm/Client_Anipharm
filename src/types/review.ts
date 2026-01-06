/**
 * Review Types
 * 리뷰 관련 타입 정의
 */

export interface Review {
  reviewId: number;
  rating: number;
  content: string;
  author: {
    userId: number;
    nickname: string;
    profileImageURL?: string;
  };
  keywords: string[];
  media: ReviewMedia[];
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewMedia {
  mediaId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

export interface ReviewSummary {
  averageRating: number | string; // 서버에서 string으로 올 수 있음
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  keywordSummary: {
    keyword: string;
    count: number;
    percentage: string;
  }[];
}

export interface ReviewListResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ReviewListOptions {
  sortBy?: 'latest' | 'popular' | 'rating';
  page?: number;
  limit?: number;
  minRating?: number;
  keyword?: string;
}

export interface CreateReviewData {
  rating: number;
  content: string;
  keywords?: string[];
  mediaFiles?: any[];
}

