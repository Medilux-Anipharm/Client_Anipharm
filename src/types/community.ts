/**
 * Community 관련 타입 정의
 */

// 게시판 타입
export type BoardType = 'free' | 'qna';

// 정렬 타입
export type SortType = 'latest' | 'popular' | 'comments';

// 게시글 카테고리 (우리동네 게시판 전용)
export type PostCategory = 'all' | 'dog' | 'cat';

// 게시글 상태
export type PostStatus = 'active' | 'sold' | 'deleted';

// 게시글 기본 정보 (목록용)
export interface PostListItem {
  postId: number;
  boardType: BoardType;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  authorProfileUrl: string | null;
  locationName: string;
  latitude: number;
  longitude: number;
  images: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  status: PostStatus;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 게시글 상세 정보
export interface PostDetail extends PostListItem {
  comments: Comment[];
}

// 댓글 타입
export interface Comment {
  commentId: number;
  postId: number;
  userId: number;
  userNickname: string;
  userProfileUrl: string | null;
  content: string;
  parentCommentId: number | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

// 게시글 작성 요청
export interface CreatePostRequest {
  boardType: BoardType;
  title: string;
  content: string;
  images?: string[];
  latitude: number;
  longitude: number;
  locationName: string;
}

// 게시글 수정 요청
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

// 댓글 작성 요청
export interface CreateCommentRequest {
  content: string;
  parentCommentId?: number;
}

// 게시글 목록 조회 요청 파라미터
export interface GetPostListParams {
  page?: number;
  limit?: number;
  sortBy?: SortType;
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
}

// 지역별 게시글 조회 파라미터
export interface GetPostListByLocationParams {
  latitude: number;
  longitude: number;
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: SortType;
}

// 페이지네이션 정보
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// 게시글 목록 응답
export interface PostListResponse {
  success: boolean;
  message: string;
  data: {
    posts: PostListItem[];
    pagination: Pagination;
  };
}

// 게시글 상세 응답
export interface PostDetailResponse {
  success: boolean;
  message: string;
  data: {
    post: PostDetail;
  };
}

// 게시글 작성/수정/삭제 응답
export interface PostMutationResponse {
  success: boolean;
  message: string;
  data?: {
    postId: number;
  };
}

// 댓글 작성/삭제 응답
export interface CommentMutationResponse {
  success: boolean;
  message: string;
  data?: {
    commentId: number;
    comment?: Comment;
  };
}

// 좋아요 응답
export interface LikeResponse {
  success: boolean;
  message: string;
  data?: {
    likeCount: number;
    isLiked: boolean;
  };
}

// 내 댓글 목록 응답
export interface MyCommentsResponse {
  success: boolean;
  message: string;
  data: {
    comments: Comment[];
    pagination: Pagination;
  };
}
