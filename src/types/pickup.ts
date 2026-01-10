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

// 픽업 상태 (서버와 동일)
export type PickupStatus =
  | 'REQUESTED'   // 유저 요청
  | 'REJECTED'    // 불가능
  | 'WAITING'     // 재고 없음 (발주 중)
  | 'ACCEPTED'    // 확인 (픽업 수락)
  | 'PREPARING'   // 준비 중
  | 'READY'       // 픽업 가능
  | 'COMPLETED'   // 픽업 완료
  | 'CANCELED';   // 취소됨

// 픽업 요청 내역
export interface PickupRequest {
  pickupId: number;
  userId: number;
  pharmacyId: number;
  status: PickupStatus;
  totalAmount?: number;
  estimatedPickupDate?: string;
  requestedAt: string;
  acceptedAt?: string;
  preparedAt?: string;
  readyAt?: string;
  completedAt?: string;
  canceledAt?: string;
  autoCancelDate?: string;
  customerMemo?: string;
  pharmacyMemo?: string;
  rejectionReason?: string;
  cancelReason?: string;
  canceledBy?: 'USER' | 'PHARMACY' | 'AUTO';

  // 관계 데이터
  customer?: {
    userId: number;
    name: string;
    phone: string;
    email?: string;
  };
  pharmacy?: {
    pharmacyId: number;
    name: string;
    phone: string;
    address: string;
    addressDetail?: string;
  };
  products?: PickupProductItem[];
}

// 픽업 요청 상품 아이템
export interface PickupProductItem {
  id: number;
  pickupId: number;
  categoryId: string;
  categoryName: string;
  productName: string;
  manufacturer?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  petName?: string;
  petType?: string;
  note?: string;
}

// 픽업 요청 생성 데이터
export interface CreatePickupRequestData {
  pharmacyId: number;
  products: Array<{
    categoryId: string;
    categoryName: string;
    productName: string;
    manufacturer?: string;
    quantity: number;
    petName?: string;
    petType?: string;
    note?: string;
  }>;
  customerMemo?: string;
  estimatedDays?: 3 | 5; // 예상 픽업일 (3일 또는 5일)
}

// 픽업 상태 업데이트 데이터
export interface UpdatePickupStatusData {
  status: PickupStatus;
  pharmacyMemo?: string;
  rejectionReason?: string;
  cancelReason?: string;
  totalAmount?: number;
  estimatedPickupDate?: string;
  productPrices?: Array<{
    productId: number;
    unitPrice: number;
    quantity: number;
  }>;
}

// 픽업 통계
export interface PickupStats {
  REQUESTED: number;
  REJECTED: number;
  WAITING: number;
  ACCEPTED: number;
  PREPARING: number;
  READY: number;
  COMPLETED: number;
  CANCELED: number;
  todayCompleted: number;
  weekCompleted: number;
  monthCompleted: number;
}
