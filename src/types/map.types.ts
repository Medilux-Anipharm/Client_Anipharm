/**
 * Map Types
 * 지도 관련 타입 정의
 */

export type MapCategory = 'hospital' | 'pharmacy' | 'petshop' | 'hotel' | 'grooming';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  roadAddress: string;
  jibunAddress: string;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone?: string;
  latitude: number | null;
  longitude: number | null;
  description?: string;
  link?: string;
}

export interface SearchOptions {
  region?: string;
  latitude?: number;
  longitude?: number;
  display?: number;
  start?: number;
}

