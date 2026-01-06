/**
 * PlaceDetailScreen
 * 약국/병원 상세 화면 (정보, 리뷰, 사진 탭)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VeterinaryHospital } from '../../types/hospital';
import { VeterinaryPharmacy } from '../../types/pharmacy';
import { Review, ReviewSummary } from '../../types/review';
import reviewService from '../../services/review';
import ReviewItem from '../../components/review/ReviewItem';
import ReviewSummaryComponent from '../../components/review/ReviewSummary';
import { getFullMediaUrl } from '../../utils/mediaUrl';

interface PlaceDetailScreenProps {
  type: 'pharmacy' | 'hospital';
  place: VeterinaryPharmacy | VeterinaryHospital;
  onNavigateBack: () => void;
  onNavigateToReviewWrite?: (type: 'pharmacy' | 'hospital', placeId: number, placeName: string) => void;
  onNavigateToReviewDetail?: (reviewId: number) => void;
  onReviewCreated?: (reviewId?: number) => void;
}

const PlaceDetailScreen: React.FC<PlaceDetailScreenProps> = ({
  type,
  place,
  onNavigateBack,
  onNavigateToReviewWrite,
  onNavigateToReviewDetail,
  onReviewCreated,
}) => {

  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'photos'>('info');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadReviewSummary();
    if (activeTab === 'reviews') {
      loadReviews(1);
    }
  }, [activeTab, type]);

  const loadReviewSummary = async () => {
    try {
      setLoading(true);
      const rawPlaceId = type === 'pharmacy'
        ? (place as VeterinaryPharmacy).pharmacyId
        : (place as VeterinaryHospital).hospitalId;
      
      // placeId를 명시적으로 숫자로 변환
      const placeId = typeof rawPlaceId === 'string' ? parseInt(rawPlaceId, 10) : Number(rawPlaceId);
      
      console.log(`[PlaceDetailScreen] 리뷰 요약 로드 시작 - type: ${type}, rawPlaceId: ${rawPlaceId} (${typeof rawPlaceId}), placeId: ${placeId} (${typeof placeId})`);
      
      if (isNaN(placeId) || placeId <= 0) {
        throw new Error(`유효하지 않은 placeId: ${rawPlaceId}`);
      }
      
      const summaryData = type === 'pharmacy'
        ? await reviewService.getPharmacyReviewSummary(placeId)
        : await reviewService.getHospitalReviewSummary(placeId);
      
      console.log(`[PlaceDetailScreen] 리뷰 요약 로드 성공:`, JSON.stringify(summaryData));
      setSummary(summaryData);
    } catch (error: any) {
      console.error(`[PlaceDetailScreen] 리뷰 요약 로드 실패`);
      console.error(`[PlaceDetailScreen] 에러 타입:`, error.constructor.name);
      console.error(`[PlaceDetailScreen] 에러 메시지:`, error.message);
      console.error(`[PlaceDetailScreen] 에러 스택:`, error.stack);
      console.error(`[PlaceDetailScreen] 전체 에러:`, error);
      console.error(`[PlaceDetailScreen] Place 정보:`, {
        type,
        rawPlaceId: type === 'pharmacy' 
          ? (place as VeterinaryPharmacy).pharmacyId 
          : (place as VeterinaryHospital).hospitalId,
        placeIdType: typeof (type === 'pharmacy' 
          ? (place as VeterinaryPharmacy).pharmacyId 
          : (place as VeterinaryHospital).hospitalId),
        placeName: place.name
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setReviewLoading(true);
      const rawId = type === 'pharmacy'
        ? (place as VeterinaryPharmacy).pharmacyId
        : (place as VeterinaryHospital).hospitalId;
      
      // ID를 명시적으로 숫자로 변환
      const id = typeof rawId === 'string' ? parseInt(rawId, 10) : Number(rawId);
      
      if (isNaN(id) || id <= 0) {
        throw new Error(`유효하지 않은 ID: ${rawId}`);
      }

      const response = type === 'pharmacy'
        ? await reviewService.getPharmacyReviews(id, { page: pageNum, limit: 20, sortBy: 'latest' })
        : await reviewService.getHospitalReviews(id, { page: pageNum, limit: 20, sortBy: 'latest' });

      if (append) {
        // 중복 제거를 위해 Map 사용 (함수형 업데이트)
        setReviews((prev) => {
          const reviewMap = new Map<number, Review>();
          [...prev, ...response.reviews].forEach((review) => {
            reviewMap.set(review.reviewId, review);
          });
          return Array.from(reviewMap.values());
        });
      } else {
        // 중복 제거
        const reviewMap = new Map<number, Review>();
        response.reviews.forEach((review) => {
          reviewMap.set(review.reviewId, review);
        });
        setReviews(Array.from(reviewMap.values()));
      }

      setPage(response.pagination.currentPage);
      setHasMore(response.pagination.hasNextPage);
    } catch (error: any) {
      console.error('리뷰 로드 실패:', error);
      Alert.alert('오류', '리뷰를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!reviewLoading && hasMore) {
      loadReviews(page + 1, true);
    }
  };

  const handleLikePress = async (reviewId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        await reviewService.removeLike(reviewId);
      } else {
        await reviewService.addLike(reviewId);
      }
      // 리뷰 목록 새로고침
      loadReviews(1, false);
    } catch (error: any) {
      Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleWriteReview = () => {
    // 리뷰 작성 화면으로 이동
    if (onNavigateToReviewWrite) {
      const placeId = type === 'pharmacy'
        ? (place as VeterinaryPharmacy).pharmacyId
        : (place as VeterinaryHospital).hospitalId;
      onNavigateToReviewWrite(type, placeId, place.name);
    }
  };

  // 리뷰 작성 완료 후 호출되는 함수
  const handleReviewCreated = (reviewId?: number) => {
    // 리뷰 탭으로 전환
    setActiveTab('reviews');
    // 리뷰 요약 및 목록 새로고침
    loadReviewSummary();
    loadReviews(1, false);
    
    // 리뷰 ID가 있으면 상세 페이지로 이동
    if (reviewId && onNavigateToReviewDetail) {
      setTimeout(() => {
        onNavigateToReviewDetail(reviewId);
      }, 500); // 리뷰 목록이 로드된 후 이동
    }
    
    // 부모 컴포넌트에 알림
    if (onReviewCreated) {
      onReviewCreated(reviewId);
    }
  };

  const renderInfoTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.infoSection}>
          {/* 주소 */}
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>주소</Text>
              <Text style={styles.infoValue}>
                {place.address} • {place.distance ? `${(place.distance * 1000).toFixed(0)}m` : ''}
              </Text>
            </View>
          </View>

          {/* 영업시간 */}
          {('operatingHours' in place && place.operatingHours) && (
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>영업시간</Text>
                <Text style={styles.infoValue}>
                  {place.operatingHours.split('\n')[0]} 전체 시간 보기 {'>'}
                </Text>
              </View>
            </View>
          )}

          {/* 전화번호 */}
          {place.phone && (
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>전화번호</Text>
                <Text style={styles.infoValue}>{place.phone}</Text>
              </View>
            </View>
          )}

          {/* 기타 정보 */}
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>기타 정보</Text>
              <Text style={styles.infoValue}>
                {type === 'pharmacy' ? '주차가능 등등' : '주차가능, 응급실 운영 등등'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderReviewsTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8A3D" />
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {summary && (
          <ReviewSummaryComponent summary={summary} onWriteReview={handleWriteReview} />
        )}
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.reviewId.toString()}
          renderItem={({ item }) => (
            <ReviewItem
              review={item}
              onPress={() => onNavigateToReviewDetail && onNavigateToReviewDetail(item.reviewId)}
              onLikePress={() => handleLikePress(item.reviewId, item.isLiked)}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            reviewLoading ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#FF8A3D" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !reviewLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>아직 리뷰가 없습니다.</Text>
              </View>
            ) : null
          }
        />
      </View>
    );
  };

  const renderPhotosTab = () => {
    // 모든 리뷰의 미디어를 수집
    const allMedia = reviews.flatMap((review) => review.media);
    const photos = allMedia.filter((media) => media.mediaType === 'image');
    
    console.log(`[PlaceDetailScreen] 사진 탭 - 총 미디어 수: ${allMedia.length}, 이미지 수: ${photos.length}`);
    console.log(`[PlaceDetailScreen] 사진 데이터:`, JSON.stringify(photos, null, 2));

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.photosGrid}>
          {photos.length > 0 ? (
            photos.map((photo, index) => {
              const fullUrl = getFullMediaUrl(photo.mediaUrl);
              console.log(`[PlaceDetailScreen] 사진 ${index + 1} - mediaId: ${photo.mediaId}`);
              console.log(`[PlaceDetailScreen] 원본 URL: ${photo.mediaUrl}`);
              console.log(`[PlaceDetailScreen] 변환된 URL: ${fullUrl}`);
              
              return (
                <TouchableOpacity
                  key={photo.mediaId}
                  style={styles.photoItem}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: fullUrl }}
                    style={styles.photo}
                    resizeMode="cover"
                    onLoad={() => {
                      console.log(`[PlaceDetailScreen] 사진 로드 성공: ${fullUrl}`);
                    }}
                    onError={(error) => {
                      console.error(`[PlaceDetailScreen] 사진 로드 실패: ${fullUrl}`, error);
                    }}
                  />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>등록된 사진이 없습니다.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onNavigateBack}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {place.name}
          </Text>
          <View style={styles.headerSubtitle}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>영업중</Text>
            </View>
            {place.ratingAverage > 0 && (
              <Text style={styles.ratingText}>
                {place.ratingAverage.toFixed(1)} ⭐
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.directionsButton}>
          <Text style={styles.directionsButtonText}>길찾기</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            정보
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            리뷰 {summary ? summary.totalReviews : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
            사진 {reviews.reduce((acc, review) => acc + review.media.filter(m => m.mediaType === 'image').length, 0)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 컨텐츠 */}
      {activeTab === 'info' && renderInfoTab()}
      {activeTab === 'reviews' && renderReviewsTab()}
      {activeTab === 'photos' && renderPhotosTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  directionsButton: {
    backgroundColor: '#FF8A3D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF8A3D',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  photoItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});

export default PlaceDetailScreen;

