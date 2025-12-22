import { use, useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  Place,
  MapCategory,
  LocationCoords,
  UseMapDataReturn,
  UseLocationReturn,
} from "../types/map";
import { VeterinaryHospital } from "../types/hospital"; // 동물병원
import { VeterinaryPharmacy } from "../types/pharmacy"; // 동물약국
import mapService from "../services/map";
import hospitalService from '../services/hospital'
import pharmacyService from "../services/pharmacy";
import * as Location from 'expo-location'

export const useLocation = (userId?: number): UseLocationReturn => {
    const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null)
    const [loading, setLoading] = useState(false)
    const [ error, setError ] = useState<string | null>(null)
    // 현재 위치가져오기
    const getCurrentLocation= async ()=>{
        try {
            setLoading(true)
            setError(null)
            // 권한 요청하기
            const {status} = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted'){
                console.log('위치 권한이 거부되어, 기본 위치(서울시청) ㄱㄱ')
                const defaultLocation = { latitude: 37.5665, longitude: 126.9780 };
                setCurrentLocation(defaultLocation);
                return;
            }

            //현재 위치 가져오기
            const location = await Location.getCurrentPositionAsync({
                accuracy : Location.Accuracy.Balanced,
            })

            const userLocation = {
                latitude : location.coords.latitude,
                longitude : location.coords.longitude
            }

            setCurrentLocation(userLocation)
            console.log('유저 위치가 확인되었습니다.')
            // 백엔드로 보내는 로직
            try{
                await mapService.sendLocation(
                    userLocation.latitude,
                    userLocation.longitude,
                    userId
                )
                console.log('위치 백엔드로 전송')

            }catch(error){
                console.log('위치 백엔드로 전송실패',error)
            }
        }catch(error){
            console.log('프론트에서 위치 가져오기 실패',error)
            setError('위치를 가져올 수 없습니다.')
            setCurrentLocation({
               latitude: 37.5665,
               longitude: 126.9780
            });
        }finally{
            setLoading(false)
        }
    }// end getCurrentLocation()

    // useEffect 특정 시점에 코드 실행
    useEffect(()=>{
        getCurrentLocation(); // 현재 위치 가져오기
    }, [userId])  // 의존성 배열 (userId가 변경되면 다시 실행), 의존성 배열이 없다면 매 렌더링마다 실행 되겠쥬?
    // 반면, 의존성이 빈 배열이라면 딱 한 번만 실행 될 것입니다. 컴포넌트 마운트시 딱 한 번
    // 여러 의존성이 있다면 그 중 하나라도 바뀌면 실행됩니다.

    return {
        currentLocation,
        loading,
        error,
        refreshLocation : getCurrentLocation, // 왼쪽 외부에 노출 되는 이름 오른쪽 내부에서 사용되는 실제 함수
    }
};// end useLocation