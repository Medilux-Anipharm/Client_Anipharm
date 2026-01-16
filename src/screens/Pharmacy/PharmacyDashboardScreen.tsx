/**
 * PharmacyDashboardScreen
 * 약국 관리자 대시보드
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pickupService from '../../services/pickup';
import reviewService from '../../services/review';

interface PharmacyData {
  pharmacyId: string;
  pharmacyEmail: string;
  businessNumber: string;
  name: string;
  phone: string;
  address: string;
  isActive: boolean;
}

interface PharmacyDashboardScreenProps {
  onLogout: () => void;
  onNavigateToPickupRequests?: () => void;
}

const PharmacyDashboardScreen = ({ onLogout, onNavigateToPickupRequests }: PharmacyDashboardScreenProps) => {
  const [pharmacyData, setPharmacyData] = useState<PharmacyData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 통계 데이터 (향후 API에서 가져올 예정)
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedToday: 0,
    totalReviews: 0,
    averageRating: 0.0,
  });

  useEffect(() => {
    console.log('[PharmacyDashboard] 컴포넌트 마운트');
    // 기존 pharmacyToken 마이그레이션 (초기 1회만 실행)
    const migrateToken = async () => {
      try {
        const oldToken = await AsyncStorage.getItem('pharmacyToken');
        if (oldToken) {
          console.log('[PharmacyDashboard] 기존 pharmacyToken 발견, authToken으로 마이그레이션');
          await AsyncStorage.setItem('authToken', oldToken);
          await AsyncStorage.removeItem('pharmacyToken');
        }
      } catch (error) {
        console.error('[PharmacyDashboard] 토큰 마이그레이션 실패:', error);
      }
    };

    const init = async () => {
      try {
        await migrateToken();
        await loadPharmacyData();
        await loadStats();
      } catch (error) {
        console.error('[PharmacyDashboard] 초기화 실패:', error);
        Alert.alert('오류', '약국 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /**
   * 약국 정보 로드
   */
  const loadPharmacyData = async (): Promise<PharmacyData | null> => {
    try {
      console.log('[PharmacyDashboard] 약국 정보 로드 시작');
      const data = await AsyncStorage.getItem('pharmacyData');
      if (data) {
        const parsedData = JSON.parse(data) as PharmacyData;
        console.log('[PharmacyDashboard] 약국 정보 로드 성공:', parsedData);
        setPharmacyData(parsedData);
        return parsedData;
      } else {
        console.warn('[PharmacyDashboard] 약국 정보가 없습니다.');
        return null;
      }
    } catch (error) {
      console.error('[PharmacyDashboard] 약국 정보 로드 실패:', error);
      throw error;
    }
  };

  /**
   * 통계 데이터 로드
   */
  const loadStats = async () => {
    try {
      console.log('[PharmacyDashboard] 통계 데이터 로드 시작');
      
      const pharmacyInfo = await loadPharmacyData();
      if (!pharmacyInfo) {
        console.error('[PharmacyDashboard] 약국 정보가 없어 통계를 불러올 수 없습니다.');
        return;
      }

      const pharmacyId = Number(pharmacyInfo.pharmacyId);
      if (!pharmacyId || isNaN(pharmacyId)) {
        console.error('[PharmacyDashboard] 약국 ID가 유효하지 않습니다:', pharmacyInfo.pharmacyId);
        return;
      }

      console.log('[PharmacyDashboard] 약국 ID:', pharmacyId);

      // 픽업 통계와 리뷰 통계를 병렬로 로드
      const [pickupStats, reviewSummary] = await Promise.allSettled([
        pickupService.getPharmacyStats(),
        reviewService.getPharmacyReviewSummary(pharmacyId),
      ]);

      console.log('[PharmacyDashboard] 픽업 통계:', pickupStats);
      console.log('[PharmacyDashboard] 리뷰 통계:', reviewSummary);

      // 픽업 통계 처리
      if (pickupStats.status === 'fulfilled') {
        const pickupData = pickupStats.value;
        console.log('[PharmacyDashboard] 픽업 통계 데이터:', pickupData);
        
        // pendingRequests 계산 (REQUESTED, WAITING 상태)
        const pendingRequests = (pickupData.REQUESTED || 0) + (pickupData.WAITING || 0);
        
        // completedToday 계산
        const completedToday = pickupData.todayCompleted || 0;

        setStats(prev => ({
          ...prev,
          pendingRequests,
          completedToday,
        }));
      } else {
        console.error('[PharmacyDashboard] 픽업 통계 로드 실패:', pickupStats.reason);
      }

      // 리뷰 통계 처리
      if (reviewSummary.status === 'fulfilled') {
        const reviewData = reviewSummary.value;
        console.log('[PharmacyDashboard] 리뷰 통계 데이터:', reviewData);
        
        const averageRating = typeof reviewData.averageRating === 'string' 
          ? parseFloat(reviewData.averageRating) 
          : (reviewData.averageRating || 0);
        
        setStats(prev => ({
          ...prev,
          totalReviews: reviewData.totalReviews || 0,
          averageRating: isNaN(averageRating) ? 0 : averageRating,
        }));
      } else {
        console.error('[PharmacyDashboard] 리뷰 통계 로드 실패:', reviewSummary.reason);
      }

      console.log('[PharmacyDashboard] 통계 데이터 로드 완료');
    } catch (error) {
      console.error('[PharmacyDashboard] 통계 데이터 로드 실패:', error);
    }
  };

  /**
   * 새로고침
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadPharmacyData(),
      loadStats(),
    ]);
    setRefreshing(false);
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '로그아웃',
        onPress: async () => {
          await AsyncStorage.removeItem('pharmacyToken');
          await AsyncStorage.removeItem('pharmacyData');
          onLogout();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>약국 관리</Text>
          <Text style={styles.headerSubtitle}>{pharmacyData?.name || '약국 정보 없음'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 약국 정보 카드 */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="medical" size={24} color="#FF8A3D" />
            <Text style={styles.infoTitle}>약국 정보</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>사업자번호</Text>
            <Text style={styles.infoValue}>{pharmacyData?.businessNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>전화번호</Text>
            <Text style={styles.infoValue}>{pharmacyData?.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>주소</Text>
            <Text style={styles.infoValue}>{pharmacyData?.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>상태</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {pharmacyData?.isActive ? '운영 중' : '운영 종료'}
              </Text>
            </View>
          </View>
        </View>

        {/* 통계 카드 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF5F0' }]}>
              <Ionicons name="time-outline" size={28} color="#FF8A3D" />
            </View>
            <Text style={styles.statValue}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>대기 중인 요청</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#F0F8FF' }]}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{stats.completedToday}</Text>
            <Text style={styles.statLabel}>오늘 완료</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF9E6' }]}>
              <Ionicons name="star-outline" size={28} color="#FFB800" />
            </View>
            <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>평균 평점</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#F5F0FF' }]}>
              <Ionicons name="chatbubble-outline" size={28} color="#9C27B0" />
            </View>
            <Text style={styles.statValue}>{stats.totalReviews}</Text>
            <Text style={styles.statLabel}>총 리뷰 수</Text>
          </View>
        </View>

        {/* 메뉴 버튼들 */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              console.log('[PharmacyDashboard] 픽업 요청 관리 버튼 클릭');
              if (onNavigateToPickupRequests) {
                console.log('[PharmacyDashboard] onNavigateToPickupRequests 호출');
                onNavigateToPickupRequests();
              } else {
                console.error('[PharmacyDashboard] onNavigateToPickupRequests가 정의되지 않음');
                Alert.alert('오류', '픽업 요청 관리 페이지로 이동할 수 없습니다.');
              }
            }}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="list-outline" size={24} color="#FF8A3D" />
            </View>
            <Text style={styles.menuText}>픽업 요청 관리</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              Alert.alert('개발 중', '리뷰 관리 기능은 현재 개발 중입니다.');
            }}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="star-outline" size={24} color="#FFB800" />
            </View>
            <Text style={styles.menuText}>리뷰 관리</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              Alert.alert('개발 중', '약국 정보 수정 기능은 현재 개발 중입니다.');
            }}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="settings-outline" size={24} color="#666" />
            </View>
            <Text style={styles.menuText}>약국 정보 수정</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              Alert.alert('개발 중', '통계 보기 기능은 현재 개발 중입니다.');
            }}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="stats-chart-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.menuText}>통계 보기</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 최근 활동 */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>최근 활동이 없습니다</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    margin: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activityContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});

export default PharmacyDashboardScreen;
