/**
 * Map Types
 * 지도 관련 타입 정의
 */

import { VeterinaryHospital } from "./hospital";
import { VeterinaryPharmacy } from "./pharmacy";

export type MapCategory = 'hospital' | 'pharmacy';

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

// 현재 위치
export interface LocationCoords{
  latitude : number;
  longitude : number;
}

export interface UseMapDataReturn {
  places: Place[];
  hospitals: VeterinaryHospital[];
  pharmacies: VeterinaryPharmacy[];
  selectedPlace: Place | null;
  selectedHospital: VeterinaryHospital | null;
  selectedPharmacy: VeterinaryPharmacy | null;
  loading: boolean;
  setSelectedPlace: (place: Place | null) => void;
  setSelectedHospital: (hospital: VeterinaryHospital | null) => void;
  setSelectedPharmacy: (pharmacy: VeterinaryPharmacy | null) => void;
  loadPlaces: (category: MapCategory | 'all', location: LocationCoords | null) => Promise<void>;
  searchPlaces: (query: string, category: MapCategory, location: LocationCoords | null) => Promise<void>;
  clearData: () => void;
}

export interface UseLocationReturn {
  currentLocation : LocationCoords | null;
  loading : boolean;
  error : string | null;
  refreshLocation: () => Promise<void> // 파라미터가 없고, 비동기로 실행되며, 완료되면 아무것도 돌려주지않는다.
  //파라미터가 없다는 뜻은 이 함수를 호술할때 아무것도 전달하지 않아도됨
}
