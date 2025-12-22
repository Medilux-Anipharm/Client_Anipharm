import { useState } from "react";
import { Alert } from "react-native";
import { Place, MapCategory, LocationCoords, UseMapDataReturn } from "../types/map";
import { VeterinaryHospital } from "../types/hospital";
import { VeterinaryPharmacy } from "../types/pharmacy";
import mapService from "../services/map";
import hospitalService from "../services/hospital";
import pharmacyService from "../services/pharmacy";

export const useMapData = () : UseMapDataReturn => {

  const [places, setPlaces] = useState<Place[]>([]);
  const [hospitals, setHospitals] = useState<VeterinaryHospital[]>([]);
  const [pharmacies, setPharmacies] = useState<VeterinaryPharmacy[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<VeterinaryHospital | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<VeterinaryPharmacy | null>(null);
  const [loading, setLoading] = useState(false);



const loadPlaces = async (category: MapCategory | 'all', location: LocationCoords | null){
    try {
        setLoading(true)

        if (category === 'all' && location){
            const [hospitalResults, pharmacyResult] = await Promise.all([
                hospitalService.findNearby(location.latitude, location.longitude, 5),
                pharmacyService.findNearby(location.latitude, location.longitude, 5)
            ])

        setHospitals(hospitalResults)
        setPharmacies(pharmacyResult)
        setPlaces([])

        // 첫 번째 결과 선택
        if(hospitalResults.length > 0){
            setSelectedHospital(hospitalResults[0])
            setSelectedPharmacy(null)
            setSelectedPlace(null)
        }else if (pharmacyResult.length > 0){
            setSelectedPharmacy(pharmacyResult[0])
            setSelectedHospital(null)
            setSelectedPlace(null)
        }
    }else if (category === 'hospital' && location ){
        const results = await hospitalService.findNearby(location.latitude, location.longitude, 5)
        setHospitals(results)
        setPlaces([])
        setPharmacies([])

        if(results.length > 0 ){
            setSelectedHospital(results[0])
            setSelectedPlace(null)
            setSelectedPharmacy(null)
        }
    }else if (category === 'pharmacy' && location){
        const results = await pharmacyService.findNearby(location.latitude, location.longitude, 5)
        setPharmacies(results)
        setHospitals([])
        setPlaces([])

        if (results.length > 0 ){
            setSelectedPharmacy(results[0])
            setSelectedPlace(null)
            setSelectedHospital(null)
        }
    }
    }catch(error : any){
        Alert.alert('error', error.message || '장소를 불러오는 중 오류가 발생했습니다')
    }finally{
        setLoading(false)
    }
}
    // 장수 검색
    const searchPlaces = async (
        query : string,
        category : MapCategory,
        location : LocationCoords | null
    ) => {
        try{
            setLoading(true)

            const options = location ? {
                region : query,
                latitude : location.latitude,
                longitude : location.longitude,
                display : 20
            } : {
                region : query,
                display : 20
            }

            const results = await mapService.searchByCategory(category, options)

            if (category === 'hospital') {
                const hospitalResults = results.map((place, index) => ({
                    hospitalId: index + 1,
                    name: place.name,
                    address: place.address || place.roadAddress || '',
                    latitude: place.latitude || 0,
                    longitude: place.longitude || 0,
                    is24h: false,
                    isEmergency: false,
                    ratingAverage: 0,
                    reviewCount: 0,
                }));

                setHospitals(hospitalResults)
                setPharmacies([])
                setPlaces([])

                if(hospitalResults.length > 0){
                    setSelectedHospital(hospitalResults[0])
                    setSelectedPharmacy(null)
                    setSelectedPlace(null)
                }
            } else if (category === 'pharmacy') {
                const pharmacyResults = results.map((place, index) => ({
                    pharmacyId: index + 1,
                    name: place.name,
                    address: place.address || place.roadAddress || '',
                    latitude: place.latitude || 0,
                    longitude: place.longitude || 0,
                    phone: place.telephone,
                    isLateNight: false,
                    ratingAverage: 0,
                    reviewCount: 0,
                }));

                setPharmacies(pharmacyResults)
                setHospitals([])
                setPlaces([])

                if(pharmacyResults.length > 0){
                    setSelectedPharmacy(pharmacyResults[0])
                    setSelectedHospital(null)
                    setSelectedPlace(null)
                }
            }
        }catch(error : any){
            Alert.alert('error',error.message || '검색 중 오류가 발생했습니다')
        }finally{
            setLoading(false)
        }
    }// end searchPlaces

    const clearData = () => {
        setPlaces([])
        setHospitals([])
        setPharmacies([])
        setSelectedPlace(null)
        setSelectedHospital(null)
        setSelectedPharmacy(null)
    }

    return {
        places,
        hospitals,
        pharmacies,
        selectedPlace, 
        selectedHospital,
        selectedPharmacy,
        loading,
        setSelectedHospital,
        setSelectedPharmacy,
        setSelectedPlace,
        loadPlaces,
        searchPlaces,
        clearData
    }

}// end useMapData