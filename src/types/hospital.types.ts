/**
 * Hospital Types
 * 동물병원 관련 타입 정의
 */

export interface VeterinaryHospital {
  hospitalId: number;
  name: string;
  phone?: string;
  address: string;
  operatingHours?: string;
  website?: string;
  latitude: number;
  longitude: number;
  is24h: boolean;
  isEmergency: boolean;
  ratingAverage: number;
  reviewCount: number;
  distance?: number; // km 단위 (주변 검색 시 포함)
  createdAt?: string;
  updatedAt?: string;
}

export interface HospitalMarker {
  id: number;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  address: string;
  phone?: string;
  is24h: boolean;
  isEmergency: boolean;
  rating: number;
  reviewCount: number;
}

export interface NearbyHospitalsResponse {
  success: boolean;
  data: VeterinaryHospital[];
}

export interface HospitalDetailResponse {
  success: boolean;
  data: VeterinaryHospital;
}

export interface HospitalMarkersResponse {
  success: boolean;
  data: HospitalMarker[];
}

