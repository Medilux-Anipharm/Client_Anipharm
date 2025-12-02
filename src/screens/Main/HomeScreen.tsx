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
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types/auth.types';
import mapService from '../../services/map.service';
import hospitalService from '../../services/hospital.service';
import { Place, MapCategory } from '../../types/map.types';
import { VeterinaryHospital } from '../../types/hospital.types';
import { NAVER_MAP_CLIENT_ID } from '../../config/api.config';

type TabType = 'home' | 'community' | 'chatbot' | 'journal' | 'profile';

interface HomeScreenProps {
  userData: User | null;
  onLogout: () => void;
  onNavigateToPetProfile?: () => void;
}

const HomeScreen = ({ userData, onLogout, onNavigateToPetProfile }: HomeScreenProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MapCategory | 'all'>('all');
  const [places, setPlaces] = useState<Place[]>([]);
  const [hospitals, setHospitals] = useState<VeterinaryHospital[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<VeterinaryHospital | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'map' | 'list'>('map'); // 지도/리스트 뷰 모드
  const webViewRef = useRef<WebView>(null);

  // 초기 위치 설정 (서울시청 기준)
  useEffect(() => {
    setCurrentLocation({ latitude: 37.5665, longitude: 126.9780 });
  }, []);

  // 카테고리별 장소 검색
  useEffect(() => {
    if (selectedCategory !== 'all' && currentLocation) {
      loadPlaces(selectedCategory);
    }
  }, [selectedCategory, currentLocation]);

  // 장소 검색 함수
  const loadPlaces = async (category: MapCategory) => {
    try {
      setLoading(true);
      
      // 동물병원 카테고리는 DB에서 검색
      if (category === 'hospital' && currentLocation) {
        const results = await hospitalService.findNearby(
          currentLocation.latitude,
          currentLocation.longitude,
          5 // 5km 반경
        );
        setHospitals(results);
        setPlaces([]);
        if (results.length > 0) {
          setSelectedHospital(results[0]);
          setSelectedPlace(null);
        } else {
          setSelectedHospital(null);
        }
      } else {
        // 다른 카테고리는 Naver API에서 검색
        const options = currentLocation
          ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              display: 20,
            }
          : { display: 20 };
        
        const results = await mapService.searchByCategory(category, options);
        setPlaces(results);
        setHospitals([]);
        if (results.length > 0) {
          setSelectedPlace(results[0]);
          setSelectedHospital(null);
        } else {
          setSelectedPlace(null);
        }
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '장소를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색어로 주소 검색
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const geocodeResult = await mapService.geocode(searchQuery);
      setCurrentLocation({
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
      });
      
      // 검색한 위치 기준으로 장소 검색
      if (selectedCategory !== 'all') {
        await loadPlaces(selectedCategory);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '주소를 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 필터 변경
  const handleCategoryChange = (category: MapCategory | 'all') => {
    setSelectedCategory(category);
    if (category === 'all') {
      setPlaces([]);
      setHospitals([]);
      setSelectedPlace(null);
      setSelectedHospital(null);
    }
  };

  // 병원 선택 핸들러
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

  // Naver 지도 HTML 생성 (모든 플랫폼용)
  const generateMapHTML = () => {
    if (!currentLocation) return '';
    
    const naverClientId = NAVER_MAP_CLIENT_ID;
    
    const markersScript = hospitals.map((hospital, index) => {
      if (!hospital.latitude || !hospital.longitude) return '';
      const isSelected = selectedHospital?.hospitalId === hospital.hospitalId;
      const hospitalName = hospital.name.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
      return `
        var marker${index} = new naver.maps.Marker({
          position: new naver.maps.LatLng(${hospital.latitude}, ${hospital.longitude}),
          map: window.map,
          title: '${hospitalName}',
          icon: {
            content: '<div style="background-color: ${isSelected ? '#FF8A3D' : '#4CAF50'}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>',
            anchor: new naver.maps.Point(0.5, 0.5)
          }
        });
        marker${index}.addListener('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerClick',
              hospitalId: ${hospital.hospitalId}
            }));
          } else {
            // 웹 환경에서 직접 처리
            handleMarkerClick(${hospital.hospitalId});
          }
        });
        window.markers.push(marker${index});
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
            // 웹 환경에서의 마커 클릭 처리
            if (window.onMarkerClick) {
              window.onMarkerClick(hospitalId);
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
          
          ${markersScript}
          
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

  // 웹용 Naver 지도 초기화
  useEffect(() => {
    if (Platform.OS === 'web' && selectedCategory === 'hospital' && hospitals.length > 0 && currentLocation) {
      // 웹 환경에서만 실행
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // Naver 지도 스크립트가 이미 로드되었는지 확인
        if ((window as any).naver && (window as any).naver.maps) {
          // 약간의 지연 후 초기화 (DOM이 준비될 때까지)
          setTimeout(() => {
            initializeWebMap();
          }, 100);
        } else {
          // Naver 지도 스크립트 로드
          const script = document.createElement('script');
          script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`;
          script.async = true;
          
          script.onload = () => {
            // 스크립트 로드 후 약간의 지연 후 초기화
            setTimeout(() => {
              initializeWebMap();
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
  }, [hospitals, currentLocation, selectedCategory, selectedHospital]);

  const initializeWebMap = () => {
    if (!currentLocation || hospitals.length === 0) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!(window as any).naver || !(window as any).naver.maps) return;
    
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

      // 마커 생성
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
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab: TabType) => {
    if (tab === 'profile' && onNavigateToPetProfile) {
      // 프로필 탭을 누르면 반려동물 프로필 등록 화면으로 이동
      onNavigateToPetProfile();
    } else {
      setActiveTab(tab);
    }
  };

  // 홈 탭 컨텐츠 렌더링
  const renderHomeContent = () => (
    <>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anipharm</Text>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="주소 또는 지역을 입력하세요"
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
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === 'hotel' && styles.filterButtonActive,
            ]}
            onPress={() => handleCategoryChange('hotel')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === 'hotel' && styles.filterButtonTextActive,
              ]}
            >
              펫호텔
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === 'grooming' && styles.filterButtonActive,
            ]}
            onPress={() => handleCategoryChange('grooming')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === 'grooming' && styles.filterButtonTextActive,
              ]}
            >
              미용
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 뷰 모드 전환 버튼 */}
      {selectedCategory === 'hospital' && hospitals.length > 0 && (
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
          ) : selectedCategory === 'hospital' && hospitals.length > 0 && currentLocation ? (
            Platform.OS === 'web' ? (
              // 웹 환경: 직접 Naver 지도 렌더링
              <View 
                style={styles.mapContainer}
                nativeID="naver-map-container"
              >
                {Platform.OS === 'web' && typeof document !== 'undefined' && (
                  <div 
                    id="naver-map" 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      minHeight: '400px'
                    }} 
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
                  ? '카테고리를 선택해주세요'
                  : selectedCategory === 'hospital'
                  ? hospitals.length === 0
                    ? '동물병원을 찾을 수 없습니다'
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
          {hospitals.length > 0 ? (
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
          ) : (
            <View style={styles.emptyListContainer}>
              <Ionicons name="location-outline" size={60} color="#999" />
              <Text style={styles.emptyListText}>동물병원을 찾을 수 없습니다</Text>
            </View>
          )}
      </View>
      )}

      {/* 하단 정보 카드 (리스트 모드일 때는 숨김) */}
      {mapViewMode === 'map' && selectedHospital ? (
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
                Alert.alert('병원 정보', `${selectedHospital.name}\n${selectedHospital.address}`);
              }}
            >
              <Ionicons name="information-circle-outline" size={18} color="#FF8A3D" />
              <Text style={styles.actionButtonText}>상세정보</Text>
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
                if (selectedPlace.link) {
                  Alert.alert('링크', selectedPlace.link);
                }
              }}
            >
              <Ionicons name="information-circle-outline" size={18} color="#FF8A3D" />
              <Text style={styles.actionButtonText}>상세정보</Text>
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
                ? '카테고리를 선택하여 장소를 검색하세요'
                : '검색 결과가 없습니다'}
            </Text>
          </View>
        </View>
      )}
    </>
  );

  // 다른 탭 컨텐츠 렌더링
  const renderOtherTabContent = (tabName: string) => (
    <View style={styles.tabPlaceholder}>
      <Ionicons name="construct-outline" size={60} color="#FF8A3D" />
      <Text style={styles.tabPlaceholderText}>{tabName} 기능</Text>
      <Text style={styles.tabPlaceholderSubText}>준비 중입니다</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 컨텐츠 영역 */}
      <View style={styles.content}>
        {activeTab === 'home' && renderHomeContent()}
        {activeTab === 'community' && renderOtherTabContent('커뮤니티')}
        {activeTab === 'chatbot' && renderOtherTabContent('챗봇')}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
