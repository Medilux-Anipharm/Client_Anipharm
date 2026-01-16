/**
 * PickupPharmacySelectScreen
 * 픽업 약국 선택 화면
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { PickupProduct } from '../../types/pickup';
import { VeterinaryPharmacy } from '../../types/pharmacy';
import pharmacyService from '../../services/pharmacy';

interface SelectedProduct {
  product: PickupProduct;
  quantity: number;
}

interface PickupPharmacySelectScreenProps {
  selectedProducts: SelectedProduct[];
  onNavigateBack: () => void;
  onConfirmPickup?: (pharmacyId: string) => void;
  onNavigateToRequestConfirm?: (pharmacy: VeterinaryPharmacy) => void;
}

const PickupPharmacySelectScreen: React.FC<PickupPharmacySelectScreenProps> = ({
  selectedProducts,
  onNavigateBack,
  onConfirmPickup,
  onNavigateToRequestConfirm,
}) => {
  const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);
  const [pharmacies, setPharmacies] = useState<VeterinaryPharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VeterinaryPharmacy[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // 위치 기반 약국 검색
  useEffect(() => {
    const loadPharmacies = async () => {
      try {
        setLoading(true);
        setError(null);

        // 위치 권한 요청
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('위치 권한이 거부되어 기본 위치(서울시청) 사용');
          // 기본 위치로 약국 검색
          const defaultLocation = { latitude: 37.5665, longitude: 126.9780 };
          const nearbyPharmacies = await pharmacyService.findNearby(
            defaultLocation.latitude,
            defaultLocation.longitude,
            10 // 10km 반경
          );
          setPharmacies(nearbyPharmacies);
          setLoading(false);
          return;
        }

        // 현재 위치 가져오기
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const currentUserLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(currentUserLocation);
        console.log('사용자 위치:', currentUserLocation);

        // 주변 약국 검색 (10km 반경)
        const nearbyPharmacies = await pharmacyService.findNearby(
          currentUserLocation.latitude,
          currentUserLocation.longitude,
          10
        );

        // 거리순으로 정렬 (API에서 이미 정렬되어 있지만 확실히 하기 위해)
        const sortedPharmacies = nearbyPharmacies.sort((a, b) => {
          const distanceA = a.distance || 999;
          const distanceB = b.distance || 999;
          return distanceA - distanceB;
        });

        console.log('주변 약국 조회 완료:', sortedPharmacies.length, '개');
        setPharmacies(sortedPharmacies);
      } catch (err: any) {
        console.error('약국 검색 실패:', err);
        setError(err.message || '약국 검색에 실패했습니다.');
        Alert.alert('오류', '주변 약국을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPharmacies();
  }, []);

  // 거리 계산 함수 (Haversine 공식)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 약국 검색
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await pharmacyService.searchByKeyword(query.trim(), 20);
      
      // 위치 정보가 있으면 거리 계산 및 정렬
      if (userLocation && results.length > 0) {
        const resultsWithDistance = results.map(pharmacy => {
          if (pharmacy.latitude && pharmacy.longitude) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              parseFloat(pharmacy.latitude.toString()),
              parseFloat(pharmacy.longitude.toString())
            );
            return {
              ...pharmacy,
              distance,
            };
          }
          return pharmacy;
        });
        
        // 거리순으로 정렬
        resultsWithDistance.sort((a, b) => {
          const distanceA = a.distance || 999;
          const distanceB = b.distance || 999;
          return distanceA - distanceB;
        });
        
        setSearchResults(resultsWithDistance);
      } else {
        setSearchResults(results);
      }
    } catch (err: any) {
      console.error('약국 검색 실패:', err);
      Alert.alert('오류', '약국 검색에 실패했습니다.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 약국 선택 핸들러 (검색 결과 또는 주변 약국)
  const handlePharmacySelect = (pharmacy: VeterinaryPharmacy) => {
    setSelectedPharmacy(pharmacy.pharmacyId);
    
    // 바로 픽업 요청 확인 페이지로 이동
    if (onNavigateToRequestConfirm) {
      onNavigateToRequestConfirm(pharmacy);
    }
  };

  // PICK-11: 약국 선택 시 픽업 요청 확인 페이지로 이동
  const handleConfirmPickup = () => {
    if (!selectedPharmacy) {
      Alert.alert('알림', '약국을 선택해주세요.');
      return;
    }

    const pharmacy = [...pharmacies, ...searchResults].find(p => p.pharmacyId === selectedPharmacy);
    if (!pharmacy) return;

    // 픽업 요청 확인 페이지로 이동
    if (onNavigateToRequestConfirm) {
      onNavigateToRequestConfirm(pharmacy);
    } else {
      // 기존 동작 유지 (호환성)
      Alert.alert(
        '픽업 예약 확인',
        `${pharmacy.name}에서 픽업하시겠습니까?\n\n선택한 약품: ${selectedProducts.length}개`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            onPress: () => {
              if (onConfirmPickup) {
                onConfirmPickup(selectedPharmacy.toString());
              } else {
                Alert.alert('픽업 예약 완료', '약국에서 픽업 준비가 완료되면 알림을 보내드립니다.');
                onNavigateBack();
              }
            },
          },
        ]
      );
    }
  };

  // 거리 포맷팅
  const formatDistance = (distance?: number): string => {
    if (!distance) return '거리 정보 없음';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // 약국 카드 렌더링
  const renderPharmacyCard = (pharmacy: VeterinaryPharmacy, isFromSearch: boolean = false) => {
    const isSelected = selectedPharmacy === pharmacy.pharmacyId;

    return (
      <TouchableOpacity
        key={pharmacy.pharmacyId}
        style={[
          styles.pharmacyCard,
          isSelected && styles.pharmacyCardSelected,
        ]}
        onPress={() => {
          if (isFromSearch && onNavigateToRequestConfirm) {
            // 검색 결과에서 선택 시 바로 픽업 요청 확인 페이지로 이동
            handlePharmacySelect(pharmacy);
          } else {
            setSelectedPharmacy(pharmacy.pharmacyId);
          }
        }}
      >
        {/* 선택 체크 */}
        <View style={styles.pharmacyHeader}>
          <View style={styles.pharmacyInfo}>
            <Text style={styles.pharmacyName}>
              {pharmacy.name}
            </Text>
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={12} color="#666" />
              <Text style={styles.distanceText}>{formatDistance(pharmacy.distance)}</Text>
            </View>
          </View>

          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={28} color="#FF8A3D" />
            </View>
          )}
        </View>

        {/* 주소 */}
        <View style={styles.pharmacyDetail}>
          <Ionicons name="business" size={14} color="#666" />
          <Text style={styles.pharmacyDetailText}>
            {pharmacy.address}
            {pharmacy.addressDetail && ` ${pharmacy.addressDetail}`}
          </Text>
        </View>

        {/* 전화번호 */}
        {pharmacy.phone && (
          <View style={styles.pharmacyDetail}>
            <Ionicons name="call" size={14} color="#666" />
            <Text style={styles.pharmacyDetailText}>{pharmacy.phone}</Text>
          </View>
        )}

        {/* 상태 배지 */}
        <View style={styles.statusBadges}>
          {pharmacy.isLateNight && (
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>24시간</Text>
            </View>
          )}
          {pharmacy.ratingAverage !== undefined && pharmacy.ratingAverage > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.ratingText}>
                {pharmacy.ratingAverage.toFixed(1)}
                {pharmacy.reviewCount !== undefined && pharmacy.reviewCount > 0 && ` (${pharmacy.reviewCount})`}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>픽업 약국 선택</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 선택한 약품 요약 */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="medkit" size={24} color="#FF8A3D" />
            <Text style={styles.summaryTitle}>선택한 약품</Text>
          </View>

          {selectedProducts.map((item, index) => (
            <View key={item.product.id} style={styles.summaryItem}>
              <Text style={styles.summaryProductName}>
                {index + 1}. {item.product.nameKo}
              </Text>
              <Text style={styles.summaryQuantity}>x{item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* 안내 메시지 */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#FF8A3D" />
          <Text style={styles.infoText}>
            픽업할 약국을 선택해주세요. 약국에서 재고 확인 후 픽업 준비가 완료되면 알림을 보내드립니다.
          </Text>
        </View>

        {/* 검색창 */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="약국명 또는 주소로 검색"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#FF8A3D" style={styles.searchLoading} />
          )}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* 검색 결과 */}
        {searchQuery.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.sectionTitle}>
              검색 결과 {searchResults.length > 0 && `(${searchResults.length}개)`}
            </Text>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF8A3D" />
                <Text style={styles.loadingText}>검색 중...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map(pharmacy => renderPharmacyCard(pharmacy, true))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                <Text style={styles.emptySubText}>다른 검색어로 시도해주세요.</Text>
              </View>
            )}
          </View>
        )}

        {/* 약국 리스트 */}
        {searchQuery.length === 0 && (
          <>
            <Text style={styles.sectionTitle}>주변 약국</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF8A3D" />
            <Text style={styles.loadingText}>주변 약국을 검색 중입니다...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                // 다시 로드
                const loadPharmacies = async () => {
                  try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    const location = status === 'granted'
                      ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
                      : null;
                    
                    const currentUserLocation = location
                      ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
                      : { latitude: 37.5665, longitude: 126.9780 };
                    
                    setUserLocation(currentUserLocation);
                    
                    const nearbyPharmacies = await pharmacyService.findNearby(
                      currentUserLocation.latitude,
                      currentUserLocation.longitude,
                      10
                    );
                    
                    const sortedPharmacies = nearbyPharmacies.sort((a, b) => {
                      const distanceA = a.distance || 999;
                      const distanceB = b.distance || 999;
                      return distanceA - distanceB;
                    });
                    
                    setPharmacies(sortedPharmacies);
                  } catch (err: any) {
                    setError(err.message || '약국 검색에 실패했습니다.');
                  } finally {
                    setLoading(false);
                  }
                };
                loadPharmacies();
              }}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : pharmacies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>주변에 약국이 없습니다.</Text>
            <Text style={styles.emptySubText}>반경을 넓혀서 다시 검색해주세요.</Text>
          </View>
        ) : (
          pharmacies.map(pharmacy => renderPharmacyCard(pharmacy, false))
        )}
          </>
        )}
      </ScrollView>

      {/* 하단 버튼 */}
      {selectedPharmacy && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmPickup}
          >
            <Text style={styles.confirmButtonText}>픽업 예약하기</Text>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#FFF5ED',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryProductName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  summaryQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8A3D',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  pharmacyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pharmacyCardSelected: {
    borderWidth: 2,
    borderColor: '#FF8A3D',
  },
  pharmacyCardClosed: {
    opacity: 0.6,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  selectedBadge: {
    marginLeft: 12,
  },
  pharmacyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pharmacyDetailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  textDisabled: {
    color: '#999',
  },
  statusBadges: {
    flexDirection: 'row',
    marginTop: 8,
  },
  openBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  openBadgeText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  closedBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  closedBadgeText: {
    fontSize: 11,
    color: '#F44336',
    fontWeight: '600',
  },
  stockBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
  noStockBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noStockBadgeText: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#FF8A3D',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF8A3D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: 4,
    fontSize: 14,
    color: '#999',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  searchLoading: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  searchResultsContainer: {
    marginBottom: 24,
  },
});

export default PickupPharmacySelectScreen;
