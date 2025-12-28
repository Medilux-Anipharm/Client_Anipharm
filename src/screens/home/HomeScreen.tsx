/**
 * HomeScreen
 * 로그인 후 메인 화면 (지도 기반)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { User } from '../../types/auth';
import mapService from '../../services/map';
import hospitalService from '../../services/hospital';
import pharmacyService from '../../services/pharmacy';
import { Place, MapCategory } from '../../types/map';
import { VeterinaryHospital } from '../../types/hospital';
import { VeterinaryPharmacy } from '../../types/pharmacy';
import { NAVER_MAP_CLIENT_ID } from '../../config/api';
import ChatbotScreen from '../chatbot/ChatbotScreen';
import CommunityScreen from '../Community/CommunityScreen';
import { useLocation } from '../../hooks/useLocation';
import { useMapData } from '../../hooks/useMapData';
import { BoardType } from '../../types/community';

type TabType = 'home' | 'community' | 'chatbot' | 'journal' | 'profile';

interface HomeScreenProps {
  userData: User | null;
  onLogout: () => void;
  onNavigateToPetProfile?: () => void;
  onNavigateToHealthCheck?: (petId?: number) => void;
  onNavigateToCareChat?: (petId?: number) => void;
  onNavigateToCareInbox?: () => void;
  onNavigateToCommunity?: () => void;
  onNavigateToPostDetail?: (postId: number) => void;
  onNavigateToPostWrite?: (boardType: BoardType) => void;
  initialTab?: TabType;
}




const HomeScreen = ({
  userData,
  onLogout,
  onNavigateToPetProfile,
  onNavigateToHealthCheck,
  onNavigateToCareChat,
  onNavigateToCareInbox,
  onNavigateToCommunity,
  onNavigateToPostDetail,
  onNavigateToPostWrite,
  initialTab,
}: HomeScreenProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'home');

  // initialTab이 변경되면 activeTab 업데이트
  useEffect(() => {
    console.log('[HomeScreen] initialTab 변경됨:', initialTab);
    if (initialTab) {
      console.log('[HomeScreen] activeTab을', initialTab, '으로 설정');
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // 컴포넌트 마운트 시 initialTab 확인
  useEffect(() => {
    console.log('[HomeScreen] 마운트됨, initialTab:', initialTab, 'activeTab:', activeTab);
    if (initialTab && initialTab !== activeTab) {
      console.log('[HomeScreen] initialTab과 activeTab이 다름, activeTab 업데이트');
      setActiveTab(initialTab);
    }
  }, []);

  // activeTab 변경 시 로그
  useEffect(() => {
    console.log('[HomeScreen] activeTab 변경됨:', activeTab);
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MapCategory | 'all'>('all');
  const {currentLocation } = useLocation(userData?.userId)
  const [mapViewMode, setMapViewMode] = useState<'map' | 'list'>('map'); // 지도/리스트 뷰 모드
  const webViewRef = useRef<WebView>(null);
  const {
    places,
    hospitals,
    pharmacies,
    selectedPlace,
    selectedHospital,
    selectedPharmacy,
    loading,
    loadPlaces,
    searchPlaces,
    setSelectedPlace,
    setSelectedHospital,
    setSelectedPharmacy
  } = useMapData()

  useEffect(()=>{
    // currentLocation이 없어도 기본 위치로 조회 가능하도록 수정
    loadPlaces(selectedCategory, currentLocation)
  }, [selectedCategory, currentLocation])

  // 검색 핸들러
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    if (selectedCategory === 'all') {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }

    if (currentLocation) {
      searchPlaces(searchQuery, selectedCategory as MapCategory, currentLocation);
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: MapCategory | 'all') => {
    setSelectedCategory(category);
  };

  // 병원 선택 핸들러
  // 네이버 지도 앱으로 열기
  const openNaverMap = async (name: string, latitude: number, longitude: number) => {
    try {
      let url = '';
      
      if (Platform.OS === 'ios') {
        // iOS: 네이버 지도 앱 URL
        url = `nmap://search?query=${encodeURIComponent(name)}&appname=com.anonymous.Client-Anipharm`;
      } else if (Platform.OS === 'android') {
        // Android: 네이버 지도 앱 Intent
        url = `intent://search?query=${encodeURIComponent(name)}#Intent;scheme=nmap;package=com.nhn.android.nmap;end`;
      } else {
        // Web: 네이버 지도 웹 URL
        url = `https://map.naver.com/v5/search/${encodeURIComponent(name)}`;
      }
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // 앱이 설치되지 않은 경우 웹으로 열기
        const webUrl = `https://map.naver.com/v5/search/${encodeURIComponent(name)}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('네이버 지도 열기 실패:', error);
      Alert.alert('오류', '네이버 지도를 열 수 없습니다.');
    }
  };

  const handleHospitalSelect = (hospital: VeterinaryHospital) => {
    setSelectedHospital(hospital);
    // 지도 중심 이동 (WebView 사용 시)
    if (webViewRef.current && hospital.latitude && hospital.longitude) {
      const script = `
        if (window.map) {
          window.map.setCenter(new naver.maps.LatLng(${hospital.latitude}, ${hospital.longitude}));
          window.map.setZoom(16);
          // 선택된 마커 강조
          if (window.markers) {
            window.markers.forEach(function(marker, index) {
              if (index === ${hospitals.findIndex(h => h.hospitalId === hospital.hospitalId)}) {
                marker.setIcon({
                  content: '<div style="background-color: #FF8A3D; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">' + (index + 1) + '</div>',
                  anchor: new naver.maps.Point(0.5, 0.5)
                });
              } else {
                marker.setIcon({
                  content: '<div style="background-color: #4CAF50; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">' + (index + 1) + '</div>',
                  anchor: new naver.maps.Point(0.5, 0.5)
                });
              }
            });
          }
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const handlePharmacySelect = (pharmacy: VeterinaryPharmacy) => {
    setSelectedPharmacy(pharmacy);
    // 지도 중심 이동 (WebView 사용 시)
    if (webViewRef.current && pharmacy.latitude && pharmacy.longitude) {
      const script = `
        if (window.map) {
          window.map.setCenter(new naver.maps.LatLng(${pharmacy.latitude}, ${pharmacy.longitude}));
          window.map.setZoom(16);
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setSelectedHospital(null);
    setSelectedPharmacy(null);
    // 지도 중심 이동 (WebView 사용 시)
    if (webViewRef.current && place.latitude && place.longitude) {
      const script = `
        if (window.map) {
          window.map.setCenter(new naver.maps.LatLng(${place.latitude}, ${place.longitude}));
          window.map.setZoom(16);
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  // Naver 지도 HTML 생성 (모든 플랫폼용)
  const generateMapHTML = () => {
    if (!currentLocation) return '';
    
    const naverClientId = NAVER_MAP_CLIENT_ID;
    
    // 병원 마커 스크립트
    const hospitalMarkersScript = hospitals.map((hospital, index) => {
      if (!hospital.latitude || !hospital.longitude) return '';
      const isSelected = selectedHospital?.hospitalId === hospital.hospitalId;
      const hospitalName = hospital.name.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
      return `
        var hospitalMarker${index} = new naver.maps.Marker({
          position: new naver.maps.LatLng(${hospital.latitude}, ${hospital.longitude}),
          map: window.map,
          title: '${hospitalName}',
          icon: {
            content: '<div style="background-color: ${isSelected ? '#FF8A3D' : '#4CAF50'}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>',
            anchor: new naver.maps.Point(0.5, 0.5)
          }
        });
        hospitalMarker${index}.addListener('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerClick',
              hospitalId: ${hospital.hospitalId},
              name: '${hospitalName}',
              latitude: ${hospital.latitude},
              longitude: ${hospital.longitude}
            }));
          } else {
            // 웹 환경에서 직접 처리
            handleMarkerClick(${hospital.hospitalId});
          }
        });
        window.markers.push(hospitalMarker${index});
      `;
    }).join('\n');

    // 약국 마커 스크립트
    const pharmacyMarkersScript = pharmacies.map((pharmacy, index) => {
      if (!pharmacy.latitude || !pharmacy.longitude) return '';
      const isSelected = selectedPharmacy?.pharmacyId === pharmacy.pharmacyId;
      const pharmacyName = pharmacy.name.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
      return `
        var pharmacyMarker${index} = new naver.maps.Marker({
          position: new naver.maps.LatLng(${pharmacy.latitude}, ${pharmacy.longitude}),
          map: window.map,
          title: '${pharmacyName}',
          icon: {
            content: '<div style="background-color: ${isSelected ? '#FF8A3D' : '#9C27B0'}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>',
            anchor: new naver.maps.Point(0.5, 0.5)
          }
        });
        pharmacyMarker${index}.addListener('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'pharmacyClick',
              pharmacyId: ${pharmacy.pharmacyId},
              name: '${pharmacyName}',
              latitude: ${pharmacy.latitude},
              longitude: ${pharmacy.longitude}
            }));
          } else {
            // 웹 환경에서 직접 처리
            handlePharmacyClick(${pharmacy.pharmacyId});
          }
        });
        window.markers.push(pharmacyMarker${index});
      `;
    }).join('\n');

    // 장소 마커 스크립트
    const placeMarkersScript = places.map((place, index) => {
      if (!place.latitude || !place.longitude) return '';
      const isSelected = selectedPlace?.id === place.id;
      const placeName = place.name.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
      return `
        var placeMarker${index} = new naver.maps.Marker({
          position: new naver.maps.LatLng(${place.latitude}, ${place.longitude}),
          map: window.map,
          title: '${placeName}',
          icon: {
            content: '<div style="background-color: ${isSelected ? '#FF8A3D' : '#2196F3'}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>',
            anchor: new naver.maps.Point(0.5, 0.5)
          }
        });
        placeMarker${index}.addListener('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'placeClick',
              placeId: '${place.id}',
              name: '${placeName}',
              latitude: ${place.latitude},
              longitude: ${place.longitude}
            }));
          } else {
            // 웹 환경에서 직접 처리
            handlePlaceClick('${place.id}');
          }
        });
        window.markers.push(placeMarker${index});
      `;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverClientId}"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          window.markers = [];
          
          function handleMarkerClick(hospitalId) {
            // 웹 환경에서의 병원 마커 클릭 처리
            if (window.onMarkerClick) {
              window.onMarkerClick(hospitalId);
            }
          }
          
          function handlePlaceClick(placeId) {
            // 웹 환경에서의 장소 마커 클릭 처리
            if (window.onPlaceClick) {
              window.onPlaceClick(placeId);
            }
          }
          
          window.map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(${currentLocation.latitude}, ${currentLocation.longitude}),
            zoom: 14,
            zoomControl: true,
            zoomControlOptions: {
              position: naver.maps.Position.TOP_RIGHT
            }
          });
          
          ${hospitalMarkersScript}
          ${pharmacyMarkersScript}
          ${placeMarkersScript}
          
          // 현재 위치 마커
          var currentMarker = new naver.maps.Marker({
            position: new naver.maps.LatLng(${currentLocation.latitude}, ${currentLocation.longitude}),
            map: window.map,
            icon: {
              content: '<div style="background-color: #FF8A3D; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              anchor: new naver.maps.Point(0.5, 0.5)
            },
            title: '현재 위치'
          });
        </script>
      </body>
      </html>
    `;
  };

  // 웹용 Naver 지도 초기화 (모든 탭에서 작동)
  useEffect(() => {
    if (Platform.OS === 'web' && currentLocation) {
      // 웹 환경에서만 실행
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // Naver 지도 스크립트가 이미 로드되었는지 확인
        if ((window as any).naver && (window as any).naver.maps) {
          // 약간의 지연 후 초기화 (DOM이 준비될 때까지)
          setTimeout(() => {
              if (activeTab === 'home' && (hospitals.length > 0 || pharmacies.length > 0 || places.length > 0)) {
                initializeWebMap();
              } else if (activeTab !== 'home') {
              // 다른 탭의 지도 초기화
              initializeWebMapForTab(activeTab);
            }
          }, 100);
        } else {
          // Naver 지도 스크립트 로드
          const script = document.createElement('script');
          script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`;
          script.async = true;
          
          script.onload = () => {
            // 스크립트 로드 후 약간의 지연 후 초기화
            setTimeout(() => {
              if (activeTab === 'home' && (hospitals.length > 0 || pharmacies.length > 0 || places.length > 0)) {
                initializeWebMap();
              } else if (activeTab !== 'home') {
                // 다른 탭의 지도 초기화
                initializeWebMapForTab(activeTab);
              }
            }, 100);
          };

          script.onerror = () => {
            console.error('Naver 지도 API 스크립트 로드 실패');
          };

          document.head.appendChild(script);

          return () => {
            if (document.head.contains(script)) {
              document.head.removeChild(script);
            }
          };
        }
      }
    }
  }, [hospitals, pharmacies, places, currentLocation, selectedCategory, selectedHospital, selectedPharmacy, selectedPlace, activeTab]);

  // 웹 환경에서 다른 탭의 지도 초기화
  const initializeWebMapForTab = (tabName: string) => {
    if (!currentLocation) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!(window as any).naver || !(window as any).naver.maps) return;
    
    const mapElement = document.getElementById(`naver-map-${tabName}`);
    if (!mapElement) {
      return; // 해당 탭의 지도 요소가 없으면 무시
    }

    // 기존 지도 제거
    mapElement.innerHTML = '';

    try {
      // 지도 초기화 (마커 없이)
      const map = new (window as any).naver.maps.Map(`naver-map-${tabName}`, {
        center: new (window as any).naver.maps.LatLng(currentLocation.latitude, currentLocation.longitude),
        zoom: 14,
        zoomControl: true,
        zoomControlOptions: {
          position: (window as any).naver.maps.Position.TOP_RIGHT,
        },
      });

      // 현재 위치 마커만 표시
      new (window as any).naver.maps.Marker({
        position: new (window as any).naver.maps.LatLng(currentLocation.latitude, currentLocation.longitude),
        map: map,
        icon: {
          content: '<div style="background-color: #FF8A3D; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          anchor: new (window as any).naver.maps.Point(0.5, 0.5),
        },
      });
    } catch (error) {
      console.error('Naver 지도 초기화 오류:', error);
    }
  };

  const initializeWebMap = () => {
    if (!currentLocation) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!(window as any).naver || !(window as any).naver.maps) return;
    
    // React Native Web에서 nativeID는 id로 변환되므로 약간의 지연 후 찾기
    setTimeout(() => {
      const mapElement = document.getElementById('naver-map');
      if (!mapElement) {
        console.warn('naver-map 요소를 찾을 수 없습니다.');
        return;
      }

      // 기존 지도 제거
      mapElement.innerHTML = '';

      try {
        // 지도 초기화
        const map = new (window as any).naver.maps.Map('naver-map', {
          center: new (window as any).naver.maps.LatLng(currentLocation.latitude, currentLocation.longitude),
          zoom: 14,
          zoomControl: true,
          zoomControlOptions: {
            position: (window as any).naver.maps.Position.TOP_RIGHT,
          },
        });

        // 병원 마커 생성
        hospitals.forEach((hospital, index) => {
          if (!hospital.latitude || !hospital.longitude) return;
          const isSelected = selectedHospital?.hospitalId === hospital.hospitalId;
          const marker = new (window as any).naver.maps.Marker({
            position: new (window as any).naver.maps.LatLng(hospital.latitude, hospital.longitude),
            map: map,
            title: hospital.name,
            icon: {
              content: `<div style="background-color: ${isSelected ? '#FF8A3D' : '#4CAF50'}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
              anchor: new (window as any).naver.maps.Point(0.5, 0.5),
            },
          });

          (window as any).naver.maps.Event.addListener(marker, 'click', () => {
            handleHospitalSelect(hospital);
            // 네이버 지도 앱으로 열기
            if (hospital.latitude && hospital.longitude) {
              openNaverMap(hospital.name, hospital.latitude, hospital.longitude);
            }
          });
        });

        // 약국 마커 생성
        pharmacies.forEach((pharmacy, index) => {
          if (!pharmacy.latitude || !pharmacy.longitude) return;
          const isSelected = selectedPharmacy?.pharmacyId === pharmacy.pharmacyId;
          const marker = new (window as any).naver.maps.Marker({
            position: new (window as any).naver.maps.LatLng(pharmacy.latitude, pharmacy.longitude),
            map: map,
            title: pharmacy.name,
            icon: {
              content: `<div style="background-color: ${isSelected ? '#FF8A3D' : '#9C27B0'}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
              anchor: new (window as any).naver.maps.Point(0.5, 0.5),
            },
          });

          (window as any).naver.maps.Event.addListener(marker, 'click', () => {
            setSelectedPharmacy(pharmacy);
            // 네이버 지도 앱으로 열기
            if (pharmacy.latitude && pharmacy.longitude) {
              openNaverMap(pharmacy.name, pharmacy.latitude, pharmacy.longitude);
            }
          });
        });

        // 장소 마커 생성
        places.forEach((place, index) => {
          if (!place.latitude || !place.longitude) return;
          const isSelected = selectedPlace?.id === place.id;
          const marker = new (window as any).naver.maps.Marker({
            position: new (window as any).naver.maps.LatLng(place.latitude, place.longitude),
            map: map,
            title: place.name,
            icon: {
              content: `<div style="background-color: ${isSelected ? '#FF8A3D' : '#2196F3'}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
              anchor: new (window as any).naver.maps.Point(0.5, 0.5),
            },
          });

          (window as any).naver.maps.Event.addListener(marker, 'click', () => {
            setSelectedPlace(place);
            // 네이버 지도 앱으로 열기
            if (place.latitude && place.longitude) {
              openNaverMap(place.name, place.latitude, place.longitude);
            }
          });
        });

        // 현재 위치 마커
        new (window as any).naver.maps.Marker({
          position: new (window as any).naver.maps.LatLng(currentLocation.latitude, currentLocation.longitude),
          map: map,
          icon: {
            content: '<div style="background-color: #FF8A3D; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            anchor: new (window as any).naver.maps.Point(0.5, 0.5),
          },
        });
      } catch (error) {
        console.error('Naver 지도 초기화 오류:', error);
      }
    }, 100); // 100ms 지연
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab: TabType) => {
    if (tab === 'profile' && onNavigateToPetProfile) {
      // 프로필 탭을 누르면 반려동물 프로필 등록 화면으로 이동
      onNavigateToPetProfile();
    } else {
      // 커뮤니티 탭도 HomeScreen 내에서 표시
      setActiveTab(tab);
    }
  };

  // 로그아웃 핸들러
  const handleLogoutPress = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            if (onLogout) {
              onLogout();
            }
          },
        },
      ]
    );
  };

  // 홈 탭 컨텐츠 렌더링
  const renderHomeContent = () => (
    <>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anipharm</Text>
        <TouchableOpacity onPress={handleLogoutPress} style={styles.logoutButton} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="장소명 또는 키워드를 검색하세요"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search-outline" size={20} color="#FF8A3D" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 필터 버튼들 */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => handleCategoryChange('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === 'all' && styles.filterButtonTextActive,
              ]}
            >
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === 'hospital' && styles.filterButtonActive,
            ]}
            onPress={() => handleCategoryChange('hospital')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === 'hospital' && styles.filterButtonTextActive,
              ]}
            >
              동물병원
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === 'pharmacy' && styles.filterButtonActive,
            ]}
            onPress={() => handleCategoryChange('pharmacy')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === 'pharmacy' && styles.filterButtonTextActive,
              ]}
            >
              동물약국
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 뷰 모드 전환 버튼 */}
      {((selectedCategory === 'hospital' && hospitals.length > 0) || 
        (selectedCategory === 'pharmacy' && pharmacies.length > 0) ||
        (selectedCategory === 'all' && (hospitals.length > 0 || pharmacies.length > 0))) && (
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, mapViewMode === 'map' && styles.viewModeButtonActive]}
            onPress={() => setMapViewMode('map')}
          >
            <Ionicons name="map-outline" size={18} color={mapViewMode === 'map' ? '#FF8A3D' : '#666'} />
            <Text style={[styles.viewModeText, mapViewMode === 'map' && styles.viewModeTextActive]}>
              지도
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, mapViewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setMapViewMode('list')}
          >
            <Ionicons name="list-outline" size={18} color={mapViewMode === 'list' ? '#FF8A3D' : '#666'} />
            <Text style={[styles.viewModeText, mapViewMode === 'list' && styles.viewModeTextActive]}>
              리스트
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 지도/리스트 영역 */}
      {mapViewMode === 'map' ? (
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.mapLoadingContainer}>
              <ActivityIndicator size="large" color="#FF8A3D" />
              <Text style={styles.mapLoadingText}>장소를 불러오는 중...</Text>
            </View>
          ) : currentLocation ? (
            Platform.OS === 'web' ? (
              // 웹 환경: 직접 Naver 지도 렌더링
              <View 
                style={styles.mapContainer}
                nativeID="naver-map-container"
              >
                {Platform.OS === 'web' && typeof document !== 'undefined' && (
                  <View
                    nativeID="naver-map"
                    style={styles.webMapContainer}
                  />
                )}
              </View>
            ) : (
              // iOS/Android: WebView로 Naver 지도 표시
              <WebView
                ref={webViewRef}
                source={{ html: generateMapHTML() }}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mixedContentMode="always"
                allowsInlineMediaPlayback={true}
                originWhitelist={['*']}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.type === 'markerClick') {
                      const hospital = hospitals.find(h => h.hospitalId === data.hospitalId);
                      if (hospital) {
                        handleHospitalSelect(hospital);
                        // 네이버 지도 앱으로 열기
                        if (data.latitude && data.longitude && data.name) {
                          openNaverMap(data.name, data.latitude, data.longitude);
                        }
                      }
                    } else if (data.type === 'pharmacyClick') {
                      const pharmacy = pharmacies.find(p => p.pharmacyId === data.pharmacyId);
                      if (pharmacy) {
                        setSelectedPharmacy(pharmacy);
                        // 네이버 지도 앱으로 열기
                        if (data.latitude && data.longitude && data.name) {
                          openNaverMap(data.name, data.latitude, data.longitude);
                        }
                      }
                    } else if (data.type === 'placeClick') {
                      const place = places.find(p => p.id === data.placeId);
                      if (place) {
                        handlePlaceSelect(place);
                        // 네이버 지도 앱으로 열기
                        if (data.latitude && data.longitude && data.name) {
                          openNaverMap(data.name, data.latitude, data.longitude);
                        }
                      }
                    }
                  } catch (e) {
                    console.error('WebView message error:', e);
                  }
                }}
              />
            )
          ) : (
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={60} color="#FF8A3D" />
              <Text style={styles.mapPlaceholderText}>
                {selectedCategory === 'all'
                  ? places.length > 0
                    ? `${places.length}개의 동물 관련 장소를 찾았습니다`
                    : '동물 관련 장소를 검색 중...'
                  : selectedCategory === 'hospital'
                  ? hospitals.length === 0
                    ? '동물병원을 찾을 수 없습니다'
                    : '지도를 불러오는 중...'
                  : selectedCategory === 'pharmacy'
                  ? pharmacies.length === 0
                    ? '동물약국을 찾을 수 없습니다'
                    : '지도를 불러오는 중...'
                  : places.length > 0
                  ? `${places.length}개의 장소를 찾았습니다`
                  : '장소를 찾을 수 없습니다'}
              </Text>
      </View>
          )}
        </View>
      ) : (
        <View style={styles.listContainer}>
          {selectedCategory === 'hospital' && hospitals.length > 0 ? (
            <FlatList
              data={hospitals}
              keyExtractor={(item) => item.hospitalId.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.hospitalListItem,
                    selectedHospital?.hospitalId === item.hospitalId && styles.hospitalListItemSelected
                  ]}
                  onPress={() => handleHospitalSelect(item)}
                >
                  <View style={styles.hospitalListHeader}>
                    <View style={styles.hospitalListNumber}>
                      <Text style={styles.hospitalListNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.hospitalListInfo}>
                      <Text style={styles.hospitalListName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.hospitalListAddress} numberOfLines={1}>
                        {item.address}
                      </Text>
                    </View>
                    <View style={styles.hospitalListBadges}>
                      {item.is24h && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>24시</Text>
                        </View>
                      )}
                      {item.isEmergency && (
                        <View style={[styles.badge, styles.badgeEmergency]}>
                          <Text style={[styles.badgeText, styles.badgeTextEmergency]}>응급</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.hospitalListDetails}>
                    {item.distance !== undefined && (
                      <View style={styles.hospitalListDetailItem}>
                        <Ionicons name="location-outline" size={14} color="#999" />
                        <Text style={styles.hospitalListDetailText}>
                          {item.distance.toFixed(2)}km
                        </Text>
                      </View>
                    )}
                    {item.phone && (
                      <View style={styles.hospitalListDetailItem}>
                        <Ionicons name="call-outline" size={14} color="#999" />
                        <Text style={styles.hospitalListDetailText}>{item.phone}</Text>
                      </View>
                    )}
                    {item.ratingAverage > 0 && (
                      <View style={styles.hospitalListDetailItem}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.hospitalListDetailText}>
                          {item.ratingAverage.toFixed(1)} ({item.reviewCount})
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.hospitalListContent}
            />
          ) : selectedCategory === 'pharmacy' && pharmacies.length > 0 ? (
            <FlatList
              data={pharmacies}
              keyExtractor={(item) => item.pharmacyId.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.hospitalListItem,
                    selectedPharmacy?.pharmacyId === item.pharmacyId && styles.hospitalListItemSelected
                  ]}
                  onPress={() => handlePharmacySelect(item)}
                >
                  <View style={styles.hospitalListHeader}>
                    <View style={styles.hospitalListNumber}>
                      <Text style={styles.hospitalListNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.hospitalListInfo}>
                      <Text style={styles.hospitalListName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.hospitalListAddress} numberOfLines={1}>
                        {item.address}
                      </Text>
                    </View>
                    <View style={styles.hospitalListBadges}>
                      {item.isLateNight && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>심야</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.hospitalListDetails}>
                    {item.distance !== undefined && (
                      <View style={styles.hospitalListDetailItem}>
                        <Ionicons name="location-outline" size={14} color="#999" />
                        <Text style={styles.hospitalListDetailText}>
                          {item.distance.toFixed(2)}km
                        </Text>
                      </View>
                    )}
                    {item.phone && (
                      <View style={styles.hospitalListDetailItem}>
                        <Ionicons name="call-outline" size={14} color="#999" />
                        <Text style={styles.hospitalListDetailText}>{item.phone}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.hospitalListContent}
            />
          ) : (selectedCategory === 'all' && (hospitals.length > 0 || pharmacies.length > 0)) ? (
            <FlatList
              data={[
                ...hospitals.map(h => ({ type: 'hospital' as const, data: h })),
                ...pharmacies.map(p => ({ type: 'pharmacy' as const, data: p }))
              ]}
              keyExtractor={(item, index) => 
                item.type === 'hospital' 
                  ? `hospital_${(item.data as VeterinaryHospital).hospitalId}` 
                  : `pharmacy_${(item.data as VeterinaryPharmacy).pharmacyId}`
              }
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.hospitalListItem,
                    (item.type === 'hospital' && selectedHospital?.hospitalId === (item.data as VeterinaryHospital).hospitalId) ||
                    (item.type === 'pharmacy' && selectedPharmacy?.pharmacyId === (item.data as VeterinaryPharmacy).pharmacyId)
                      ? styles.hospitalListItemSelected
                      : null
                  ]}
                  onPress={() => {
                    if (item.type === 'hospital') {
                      handleHospitalSelect(item.data as VeterinaryHospital);
                    } else {
                      handlePharmacySelect(item.data as VeterinaryPharmacy);
                    }
                  }}
                >
                  <View style={styles.hospitalListHeader}>
                    <View style={styles.hospitalListNumber}>
                      <Text style={styles.hospitalListNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.hospitalListInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.hospitalListName} numberOfLines={1}>
                          {item.data.name}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: item.type === 'hospital' ? '#E3F2FD' : '#E8F5E9' }]}>
                          <Text style={[styles.statusText, { color: item.type === 'hospital' ? '#1976D2' : '#388E3C' }]}>
                            {item.type === 'hospital' ? '병원' : '약국'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.hospitalListAddress} numberOfLines={1}>
                        {item.data.address}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.hospitalListDetails}>
                    {item.data.phone && (
                      <View style={styles.hospitalListDetailItem}>
                        <Ionicons name="call-outline" size={14} color="#999" />
                        <Text style={styles.hospitalListDetailText}>{item.data.phone}</Text>
                      </View>
                    )}
                    {item.type === 'hospital' && (item.data as VeterinaryHospital).isEmergency && (
                      <View style={styles.hospitalListDetailItem}>
                        <Ionicons name="alert-circle" size={14} color="#F44336" />
                        <Text style={[styles.hospitalListDetailText, { color: '#F44336' }]}>응급</Text>
                      </View>
                    )}
                    {item.type === 'pharmacy' && (item.data as VeterinaryPharmacy).isLateNight && (
                      <View style={styles.hospitalListDetailItem}>
                        <Ionicons name="moon" size={14} color="#673AB7" />
                        <Text style={[styles.hospitalListDetailText, { color: '#673AB7' }]}>심야</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.hospitalListContent}
            />
          ) : (
            <View style={styles.emptyListContainer}>
              <Ionicons name="location-outline" size={60} color="#999" />
              <Text style={styles.emptyListText}>
                {selectedCategory === 'hospital' 
                  ? '동물병원을 찾을 수 없습니다'
                  : selectedCategory === 'pharmacy'
                  ? '동물약국을 찾을 수 없습니다'
                  : selectedCategory === 'all'
                  ? '주변 동물병원/약국을 찾을 수 없습니다'
                  : '장소를 찾을 수 없습니다'}
              </Text>
            </View>
          )}
      </View>
      )}

      {/* 하단 정보 카드 (리스트 모드일 때는 숨김) */}
      {mapViewMode === 'map' && selectedPharmacy ? (
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.infoCardTitle} numberOfLines={1}>
              {selectedPharmacy.name}
            </Text>
            <View style={styles.statusBadge}>
              {selectedPharmacy.isLateNight && (
                <Text style={styles.statusText}>심야</Text>
              )}
            </View>
          </View>
          <Text style={styles.infoCardAddress} numberOfLines={1}>
            {selectedPharmacy.address}
          </Text>
          {selectedPharmacy.phone && (
            <View style={styles.infoCardDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{selectedPharmacy.phone}</Text>
              </View>
            </View>
          )}
          {selectedPharmacy.distance !== undefined && (
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceText}>
                거리: {selectedPharmacy.distance.toFixed(2)}km
              </Text>
            </View>
          )}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (selectedPharmacy.latitude && selectedPharmacy.longitude) {
                  openNaverMap(selectedPharmacy.name, selectedPharmacy.latitude, selectedPharmacy.longitude);
                } else {
                  Alert.alert('약국 정보', `${selectedPharmacy.name}\n${selectedPharmacy.address}`);
                }
              }}
            >
              <Ionicons name="map-outline" size={18} color="#FF8A3D" />
              <Text style={styles.actionButtonText}>지도에서 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reserveButton}>
              <Text style={styles.reserveButtonText}>예약하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : mapViewMode === 'map' && selectedHospital ? (
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.infoCardTitle} numberOfLines={1}>
              {selectedHospital.name}
            </Text>
            <View style={styles.statusBadge}>
              {selectedHospital.is24h && (
                <Text style={styles.statusText}>24시간</Text>
              )}
              {selectedHospital.isEmergency && (
                <Text style={[styles.statusText, { color: '#F44336' }]}>응급</Text>
              )}
            </View>
          </View>
          <Text style={styles.infoCardAddress} numberOfLines={1}>
            {selectedHospital.address}
          </Text>
          {selectedHospital.phone && (
            <View style={styles.infoCardDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{selectedHospital.phone}</Text>
              </View>
            </View>
          )}
          {selectedHospital.distance !== undefined && (
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceText}>
                거리: {selectedHospital.distance.toFixed(2)}km
              </Text>
              {selectedHospital.ratingAverage > 0 && (
                <Text style={styles.distanceText}>
                  평점: {selectedHospital.ratingAverage.toFixed(1)} ({selectedHospital.reviewCount}개 리뷰)
                </Text>
              )}
            </View>
          )}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (selectedHospital.latitude && selectedHospital.longitude) {
                  openNaverMap(selectedHospital.name, selectedHospital.latitude, selectedHospital.longitude);
                } else {
                  Alert.alert('병원 정보', `${selectedHospital.name}\n${selectedHospital.address}`);
                }
              }}
            >
              <Ionicons name="map-outline" size={18} color="#FF8A3D" />
              <Text style={styles.actionButtonText}>지도에서 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reserveButton}>
              <Text style={styles.reserveButtonText}>예약하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : selectedPlace ? (
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.infoCardTitle} numberOfLines={1}>
              {selectedPlace.name}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>정보</Text>
            </View>
          </View>
          <Text style={styles.infoCardAddress} numberOfLines={1}>
            {selectedPlace.roadAddress || selectedPlace.address}
          </Text>
          {selectedPlace.telephone && (
            <View style={styles.infoCardDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{selectedPlace.telephone}</Text>
              </View>
            </View>
          )}
          {selectedPlace.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{selectedPlace.category}</Text>
            </View>
          )}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (selectedPlace.latitude && selectedPlace.longitude) {
                  openNaverMap(selectedPlace.name, selectedPlace.latitude, selectedPlace.longitude);
                } else if (selectedPlace.link) {
                  Linking.openURL(selectedPlace.link);
                } else {
                  Alert.alert('장소 정보', `${selectedPlace.name}\n${selectedPlace.address}`);
                }
              }}
            >
              <Ionicons name="map-outline" size={18} color="#FF8A3D" />
              <Text style={styles.actionButtonText}>지도에서 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reserveButton}>
              <Text style={styles.reserveButtonText}>예약하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.infoCard}>
          <View style={styles.emptyCard}>
            <Ionicons name="location-outline" size={40} color="#999" />
            <Text style={styles.emptyCardText}>
              {selectedCategory === 'all'
                ? places.length === 0
                  ? '동물 관련 장소를 검색 중...'
                  : '검색 결과가 없습니다'
                : '검색 결과가 없습니다'}
            </Text>
          </View>
        </View>
      )}
    </>
  );

  // 다른 탭 컨텐츠 렌더링 (지도 포함)
  const renderOtherTabContent = (tabName: string) => (
    <>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tabName}</Text>
      </View>
      
      {/* 지도 영역 */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          Platform.OS === 'web' ? (
            <View style={styles.mapContainer}>
              {Platform.OS === 'web' && typeof document !== 'undefined' && (
                <View
                  nativeID={`naver-map-${tabName}`}
                  style={styles.webMapContainer}
                />
              )}
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              source={{ html: generateMapHTML() }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mixedContentMode="always"
              allowsInlineMediaPlayback={true}
              originWhitelist={['*']}
            />
          )
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={60} color="#FF8A3D" />
            <Text style={styles.mapPlaceholderText}>지도를 불러오는 중...</Text>
          </View>
        )}
      </View>
      
      {/* 탭별 추가 컨텐츠 */}
    <View style={styles.tabPlaceholder}>
        <Ionicons name="construct-outline" size={40} color="#FF8A3D" />
      <Text style={styles.tabPlaceholderText}>{tabName} 기능</Text>
      <Text style={styles.tabPlaceholderSubText}>준비 중입니다</Text>
    </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 컨텐츠 영역 */}
      <View style={styles.content}>
        {activeTab === 'home' && renderHomeContent()}
        {activeTab === 'community' && (
          <CommunityScreen
            onNavigateToPostDetail={(postId) => {
              if (onNavigateToPostDetail) {
                onNavigateToPostDetail(postId);
              }
            }}
            onNavigateToPostWrite={(boardType) => {
              if (onNavigateToPostWrite) {
                onNavigateToPostWrite(boardType);
              }
            }}
            userData={userData || undefined}
            userLocation={currentLocation ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              locationName: '서울시청'
            } : undefined}
          />
        )}
        {activeTab === 'chatbot' && (
          <ChatbotScreen
            onSelectHealthConsult={() => onNavigateToHealthCheck?.()}
            onSelectCareConsult={() => {
              console.log('[HomeScreen] 케어 관리 상담 버튼 클릭됨');
              if (onNavigateToCareChat) {
                console.log('[HomeScreen] onNavigateToCareChat 호출');
                onNavigateToCareChat();
              } else {
                console.warn('[HomeScreen] onNavigateToCareChat이 정의되지 않음');
              }
            }}
            onNavigateToInbox={() => {
              console.log('[HomeScreen] 보관함 버튼 클릭됨');
              if (onNavigateToCareInbox) {
                console.log('[HomeScreen] onNavigateToCareInbox 호출');
                onNavigateToCareInbox();
              } else {
                console.warn('[HomeScreen] onNavigateToCareInbox가 정의되지 않음');
              }
            }}
          />
        )}
        {activeTab === 'journal' && renderOtherTabContent('일지')}
      </View>

      {/* 하단 네비게이션 바 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('home')}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={24}
            color={activeTab === 'home' ? '#FF8A3D' : '#999'}
          />
          <Text style={[
            styles.navText,
            activeTab === 'home' && styles.navTextActive
          ]}>
            홈
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('community')}
        >
          <Ionicons
            name={activeTab === 'community' ? 'document-text' : 'document-text-outline'}
            size={24}
            color={activeTab === 'community' ? '#FF8A3D' : '#999'}
          />
          <Text style={[
            styles.navText,
            activeTab === 'community' && styles.navTextActive
          ]}>
            커뮤니티
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('chatbot')}
        >
          <Ionicons
            name={activeTab === 'chatbot' ? 'chatbubbles' : 'chatbubbles-outline'}
            size={24}
            color={activeTab === 'chatbot' ? '#FF8A3D' : '#999'}
          />
          <Text style={[
            styles.navText,
            activeTab === 'chatbot' && styles.navTextActive
          ]}>
            챗봇
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('journal')}
        >
          <Ionicons
            name={activeTab === 'journal' ? 'calendar' : 'calendar-outline'}
            size={24}
            color={activeTab === 'journal' ? '#FF8A3D' : '#999'}
          />
          <Text style={[
            styles.navText,
            activeTab === 'journal' && styles.navTextActive
          ]}>
            일지
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('profile')}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'profile' ? '#FF8A3D' : '#999'}
          />
          <Text style={[
            styles.navText,
            activeTab === 'profile' && styles.navTextActive
          ]}>
            프로필
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FF8A3D',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  searchContainer: {
    backgroundColor: '#FF8A3D',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#FFF5EF',
    borderColor: '#FF8A3D',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#FFF5EF',
  },
  viewModeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  viewModeTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  webMapContainer: {
    width: '100%',
    height: '100%',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  mapSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  infoCardAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoCardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  categoryContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  distanceContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5EF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8A3D',
  },
  reserveButton: {
    flex: 1,
    backgroundColor: '#FF8A3D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyCardText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  hospitalListContent: {
    padding: 16,
    gap: 12,
  },
  hospitalListItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalListItemSelected: {
    borderWidth: 2,
    borderColor: '#FF8A3D',
    backgroundColor: '#FFF5EF',
  },
  hospitalListHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  hospitalListNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8A3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalListNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hospitalListInfo: {
    flex: 1,
  },
  hospitalListName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hospitalListAddress: {
    fontSize: 13,
    color: '#666',
  },
  hospitalListBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeEmergency: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  badgeTextEmergency: {
    color: '#F44336',
  },
  hospitalListDetails: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  hospitalListDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hospitalListDetailText: {
    fontSize: 12,
    color: '#666',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyListText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  tabPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  tabPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  tabPlaceholderSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
});

export default HomeScreen;
