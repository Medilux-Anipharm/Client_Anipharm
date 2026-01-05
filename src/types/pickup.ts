/**
 * Pickup 관련 타입 정의
 */

// 픽업 카테고리
export interface PickupCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  products: PickupProduct[];
  warningMessage?: string;
}

// 픽업 상품
export interface PickupProduct {
  id: string;
  categoryId: string;
  name: string;
  nameKo: string;
  manufacturer: string;
  purpose: string;
  note?: string;
  usage?: string;
  safetyInfo?: string;
}

// 픽업 카테고리 타입
export type PickupCategoryType =
  | 'parasite_prevention'  // 구충·예방 관리
  | 'digestive_health'     // 장 건강·설사 관리
  | 'skin_care'           // 피부·가려움 관리
  | 'ear_care'            // 귀 염증 초기 관리
  | 'eye_care'            // 눈 관리·안구 세정
  | 'wound_care'          // 상처·피부 세정·소독
  | 'nutrition_supplement'; // 영양·면역·관절 보조
