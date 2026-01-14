/**
 * PharmacyPickupRequestsScreen
 * 약국 픽업 요청 관리 화면
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

interface PickupRequest {
  id: string;
  requestNumber: string;
  userName: string;
  petName: string;
  products: Array<{
    name: string;
    quantity: number;
  }>;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  requestedAt: string;
  notes?: string;
}

interface PharmacyPickupRequestsScreenProps {
  onNavigateBack: () => void;
}

const PharmacyPickupRequestsScreen = ({ onNavigateBack }: PharmacyPickupRequestsScreenProps) => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadRequests();
  }, []);

  /**
   * 픽업 요청 목록 로드
   */
  const loadRequests = async () => {
    try {
      // TODO: API 호출로 변경
      // 임시 데미 데이터
      const dummyRequests: PickupRequest[] = [
        {
          id: '1',
          requestNumber: 'REQ-2024-001',
          userName: '김철수',
          petName: '멍멍이',
          products: [
            { name: '관절 영양제', quantity: 1 },
            { name: '피부 연고', quantity: 2 },
          ],
          status: 'pending',
          requestedAt: '2024-01-15 14:30',
          notes: '오후 5시 이후 픽업 가능합니다.',
        },
        {
          id: '2',
          requestNumber: 'REQ-2024-002',
          userName: '이영희',
          petName: '냥냥이',
          products: [
            { name: '귀 세정제', quantity: 1 },
          ],
          status: 'confirmed',
          requestedAt: '2024-01-15 15:00',
        },
      ];
      setRequests(dummyRequests);
    } catch (error) {
      console.error('픽업 요청 로드 실패:', error);
      Alert.alert('오류', '픽업 요청을 불러오는데 실패했습니다.');
    }
  };

  /**
   * 새로고침
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  /**
   * 상태 변경
   */
  const updateRequestStatus = async (requestId: string, newStatus: PickupRequest['status']) => {
    try {
      // TODO: API 호출로 변경
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
      Alert.alert('성공', '상태가 변경되었습니다.');
    } catch (error) {
      console.error('상태 변경 실패:', error);
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
  };

  /**
   * 요청 확인
   */
  const confirmRequest = (requestId: string) => {
    Alert.alert('요청 확인', '이 요청을 확인하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: () => updateRequestStatus(requestId, 'confirmed'),
      },
    ]);
  };

  /**
   * 준비 완료
   */
  const markAsReady = (requestId: string) => {
    Alert.alert('준비 완료', '픽업 준비가 완료되었습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: () => updateRequestStatus(requestId, 'ready'),
      },
    ]);
  };

  /**
   * 픽업 완료
   */
  const markAsCompleted = (requestId: string) => {
    Alert.alert('픽업 완료', '픽업이 완료되었습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: () => updateRequestStatus(requestId, 'completed'),
      },
    ]);
  };

  /**
   * 상태 뱃지 색상
   */
  const getStatusColor = (status: PickupRequest['status']) => {
    switch (status) {
      case 'pending':
        return '#FF8A3D';
      case 'confirmed':
        return '#2196F3';
      case 'ready':
        return '#4CAF50';
      case 'completed':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  /**
   * 상태 텍스트
   */
  const getStatusText = (status: PickupRequest['status']) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'confirmed':
        return '확인됨';
      case 'ready':
        return '준비 완료';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  /**
   * 필터링된 요청 목록
   */
  const filteredRequests = selectedTab === 'pending'
    ? requests.filter(req => req.status === 'pending' || req.status === 'confirmed' || req.status === 'ready')
    : requests;

  /**
   * 요청 카드 렌더링
   */
  const renderRequestCard = (request: PickupRequest) => (
    <View key={request.id} style={styles.requestCard}>
      {/* 헤더 */}
      <View style={styles.requestHeader}>
        <View style={styles.requestHeaderLeft}>
          <Text style={styles.requestNumber}>{request.requestNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
            <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
          </View>
        </View>
        <Text style={styles.requestTime}>{request.requestedAt}</Text>
      </View>

      {/* 사용자 정보 */}
      <View style={styles.userInfo}>
        <Ionicons name="person-outline" size={16} color="#666" />
        <Text style={styles.userName}>{request.userName}</Text>
        <Ionicons name="paw-outline" size={16} color="#666" style={{ marginLeft: 12 }} />
        <Text style={styles.petName}>{request.petName}</Text>
      </View>

      {/* 상품 목록 */}
      <View style={styles.productsContainer}>
        <Text style={styles.productsTitle}>요청 상품</Text>
        {request.products.map((product, index) => (
          <View key={index} style={styles.productItem}>
            <Text style={styles.productName}>• {product.name}</Text>
            <Text style={styles.productQuantity}>x{product.quantity}</Text>
          </View>
        ))}
      </View>

      {/* 메모 */}
      {request.notes && (
        <View style={styles.notesContainer}>
          <Ionicons name="chatbox-outline" size={14} color="#666" />
          <Text style={styles.notesText}>{request.notes}</Text>
        </View>
      )}

      {/* 액션 버튼 */}
      <View style={styles.actionsContainer}>
        {request.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => confirmRequest(request.id)}
          >
            <Text style={styles.actionButtonText}>확인</Text>
          </TouchableOpacity>
        )}
        {request.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.readyButton]}
            onPress={() => markAsReady(request.id)}
          >
            <Text style={styles.actionButtonText}>준비 완료</Text>
          </TouchableOpacity>
        )}
        {request.status === 'ready' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => markAsCompleted(request.id)}
          >
            <Text style={styles.actionButtonText}>픽업 완료</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>픽업 요청 관리</Text>
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.tabTextActive]}>
            진행 중 ({filteredRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            전체 ({requests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 요청 목록 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRequests.length > 0 ? (
          filteredRequests.map(renderRequestCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {selectedTab === 'pending' ? '진행 중인 요청이 없습니다' : '픽업 요청이 없습니다'}
            </Text>
          </View>
        )}
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
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF8A3D',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  requestTime: {
    fontSize: 13,
    color: '#999',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  userName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  petName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  productsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  productsTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  productName: {
    fontSize: 14,
    color: '#333',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 6,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  readyButton: {
    backgroundColor: '#4CAF50',
  },
  completeButton: {
    backgroundColor: '#FF8A3D',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#999',
    marginTop: 16,
  },
});

export default PharmacyPickupRequestsScreen;
