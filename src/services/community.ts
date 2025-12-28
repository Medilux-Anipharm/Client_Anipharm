/**
 * Community Service
 * 커뮤니티 관련 API 요청 처리
 */

import apiClient from './api';
import { API_CONFIG } from '../config/api';
import {
  BoardType,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  GetPostListParams,
  GetPostListByLocationParams,
  PostListResponse,
  PostDetailResponse,
  PostMutationResponse,
  CommentMutationResponse,
  LikeResponse,
  MyCommentsResponse,
} from '../types/community';

/**
 * 게시글 목록 조회
 */
export const getPostList = async (
  boardType: BoardType,
  params?: GetPostListParams
): Promise<PostListResponse> => {
  const response = await apiClient.get<PostListResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.POST_LIST(boardType),
    { params }
  );
  return response.data;
};

/**
 * 지역별 게시글 목록 조회
 */
export const getPostListByLocation = async (
  boardType: BoardType,
  params: GetPostListByLocationParams
): Promise<PostListResponse> => {
  const response = await apiClient.get<PostListResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.POST_LIST_BY_LOCATION(boardType),
    { params }
  );
  return response.data;
};

/**
 * 게시글 상세 조회
 */
export const getPostDetail = async (postId: number): Promise<PostDetailResponse> => {
  const response = await apiClient.get<PostDetailResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.POST_DETAIL(postId)
  );
  return response.data;
};

/**
 * 게시글 작성
 */
export const createPost = async (
  data: CreatePostRequest
): Promise<PostMutationResponse> => {
  const response = await apiClient.post<PostMutationResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.CREATE_POST,
    data
  );
  return response.data;
};

/**
 * 게시글 수정
 */
export const updatePost = async (
  postId: number,
  data: UpdatePostRequest
): Promise<PostMutationResponse> => {
  const response = await apiClient.put<PostMutationResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.UPDATE_POST(postId),
    data
  );
  return response.data;
};

/**
 * 게시글 삭제
 */
export const deletePost = async (postId: number): Promise<PostMutationResponse> => {
  const response = await apiClient.delete<PostMutationResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.DELETE_POST(postId)
  );
  return response.data;
};

/**
 * 댓글 작성
 */
export const createComment = async (
  postId: number,
  data: CreateCommentRequest
): Promise<CommentMutationResponse> => {
  const response = await apiClient.post<CommentMutationResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.CREATE_COMMENT(postId),
    data
  );
  return response.data;
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (
  commentId: number
): Promise<CommentMutationResponse> => {
  const response = await apiClient.delete<CommentMutationResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.DELETE_COMMENT(commentId)
  );
  return response.data;
};

/**
 * 내 댓글 목록 조회
 */
export const getMyComments = async (
  page: number = 1,
  limit: number = 20
): Promise<MyCommentsResponse> => {
  const response = await apiClient.get<MyCommentsResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.MY_COMMENTS,
    { params: { page, limit } }
  );
  return response.data;
};

/**
 * 좋아요 추가
 */
export const addLike = async (postId: number): Promise<LikeResponse> => {
  const response = await apiClient.post<LikeResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.ADD_LIKE(postId)
  );
  return response.data;
};

/**
 * 좋아요 제거
 */
export const removeLike = async (postId: number): Promise<LikeResponse> => {
  const response = await apiClient.delete<LikeResponse>(
    API_CONFIG.ENDPOINTS.COMMUNITY.REMOVE_LIKE(postId)
  );
  return response.data;
};
