/**
 * Media URL Utility
 * 미디어 URL을 전체 URL로 변환하는 유틸리티
 */

import { API_CONFIG } from '../config/api';

/**
 * 미디어 URL을 전체 URL로 변환
 * @param mediaUrl - 상대 경로 또는 전체 URL
 * @returns 전체 URL
 */
export const getFullMediaUrl = (mediaUrl: string): string => {
  console.log(`[getFullMediaUrl] 입력 URL: ${mediaUrl}`);
  
  if (!mediaUrl) {
    console.warn(`[getFullMediaUrl] 빈 URL`);
    return '';
  }
  
  // 이미 전체 URL인 경우 그대로 반환
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    console.log(`[getFullMediaUrl] 전체 URL로 반환: ${mediaUrl}`);
    return mediaUrl;
  }
  
  // /app/uploads/로 시작하는 경우 /uploads/로 변환
  let normalizedUrl = mediaUrl;
  if (normalizedUrl.startsWith('/app/uploads/')) {
    normalizedUrl = normalizedUrl.replace('/app/uploads/', '/uploads/');
    console.log(`[getFullMediaUrl] /app/uploads/ 제거 후: ${normalizedUrl}`);
  }
  
  // 상대 경로인 경우 API base URL과 결합
  // API_BASE_URL에서 /api를 제거하고 /uploads를 추가
  const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
  console.log(`[getFullMediaUrl] Base URL: ${baseUrl}`);
  
  let fullUrl: string;
  // mediaUrl이 /uploads로 시작하지 않으면 추가
  if (normalizedUrl.startsWith('/uploads')) {
    fullUrl = `${baseUrl}${normalizedUrl}`;
  } else if (normalizedUrl.startsWith('uploads/')) {
    fullUrl = `${baseUrl}/${normalizedUrl}`;
  } else {
    fullUrl = `${baseUrl}/uploads/${normalizedUrl}`;
  }
  
  console.log(`[getFullMediaUrl] 변환된 URL: ${fullUrl}`);
  return fullUrl;
};

