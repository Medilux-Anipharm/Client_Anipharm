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
import pickupService from '../../services/pickup';
import { PickupRequest, PickupStatus } from '../../types/pickup';

interface PharmacyPickupRequestsScreenProps {
  onNavigateBack: () => void;
}

// 탭 타입 정의
type TabType = 'requested' | 'inProgress' | 'waiting' | 'completed' | 'rejected' | 'all';

const PharmacyPickupRequestsScreen = ({ onNavigateBack }: PharmacyPickupRequestsScreenProps) => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('requested');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [selectedTab]);

  /**
   * 픽업 요청 목록 로드
   */
  const loadRequests = async () => {
    try {
      console.log('[PharmacyPickupRequests] 목록 로드 시작...');
      setLoading(true);

      // 전체 목록 조회 후 클라이언트에서 필터링
      const response = await pickupService.getPharmacyPickupRequests();

      console.log('[PharmacyPickupRequests] ✅ 목록 로드 성공');
      console.log('[PharmacyPickupRequests] 받은 요청 개수:', response.count);
      console.log('[PharmacyPickupRequests] 요청 목록:', response.data.map(r => ({
        pickupId: r.pickupId,
        status: r.status,
        customer: r.customer?.nickname,
      })));
      setRequests(response.data);
    } catch (error: any) {
      console.error('[PharmacyPickupRequests] ❌ 픽업 요청 로드 실패:', error);
      Alert.alert('오류', error.message || '픽업 요청을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      console.log('[PharmacyPickupRequests] 목록 로드 완료 (loading: false)');
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
  const updateRequestStatus = async (pickupId: number, newStatus: PickupStatus, rejectionReason?: string) => {
    try {
      console.log('========================================');
      console.log('[PharmacyPickupRequests] 상태 변경 시작');
      console.log('[PharmacyPickupRequests] pickupId:', pickupId);
      console.log('[PharmacyPickupRequests] newStatus:', newStatus);
      console.log('[PharmacyPickupRequests] rejectionReason:', rejectionReason);
      console.log('[PharmacyPickupRequests] 현재 요청 개수:', requests.length);
      console.log('========================================');
      
      const updateData: any = { status: newStatus };
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      
      console.log('[PharmacyPickupRequests] 전송할 데이터:', JSON.stringify(updateData, null, 2));
      console.log('[PharmacyPickupRequests] API 호출 시작...');
      
      const result = await pickupService.updatePickupStatus(pickupId, updateData);
      
      console.log('[PharmacyPickupRequests] ✅ API 호출 성공');
      console.log('[PharmacyPickupRequests] 반환된 데이터:', JSON.stringify(result, null, 2));
      console.log('[PharmacyPickupRequests] 반환된 상태:', result.status);
      console.log('[PharmacyPickupRequests] 목록 새로고침 시작...');

      // 목록 새로고침
      await loadRequests();
      
      console.log('[PharmacyPickupRequests] ✅ 목록 새로고침 완료');
      console.log('[PharmacyPickupRequests] 새로고침 후 요청 개수:', requests.length);
      
      const statusMessages: Record<PickupStatus, string> = {
        ACCEPTED: '요청이 확인되었습니다.',
        REJECTED: '요청이 거절되었습니다.',
        WAITING: '발주 처리되었습니다.',
        PREPARING: '준비가 시작되었습니다.',
        READY: '준비가 완료되었습니다.',
        COMPLETED: '픽업이 완료되었습니다.',
        REQUESTED: '상태가 변경되었습니다.',
        CANCELED: '요청이 취소되었습니다.',
      };
      
      console.log('[PharmacyPickupRequests] 성공 메시지 표시:', statusMessages[newStatus]);
      console.log('========================================');
      Alert.alert('성공', statusMessages[newStatus] || '상태가 변경되었습니다.');
    } catch (error: any) {
      console.error('========================================');
      console.error('[PharmacyPickupRequests] ❌ 상태 변경 실패');
      console.error('[PharmacyPickupRequests] 에러 타입:', error?.constructor?.name);
      console.error('[PharmacyPickupRequests] 에러 메시지:', error?.message);
      console.error('[PharmacyPickupRequests] 에러 스택:', error?.stack);
      if (error?.response) {
        console.error('[PharmacyPickupRequests] 응답 상태:', error.response.status);
        console.error('[PharmacyPickupRequests] 응답 데이터:', JSON.stringify(error.response.data, null, 2));
      }
      console.error('========================================');
      Alert.alert('오류', error.message || '상태 변경에 실패했습니다.');
    }
  };

  /**
   * 요청 확인 (REQUESTED → ACCEPTED)
   */
  const confirmRequest = async (pickupId: number) => {
    console.log('[PharmacyPickupRequests] 확인 버튼 클릭 - pickupId:', pickupId);

    // 웹 환경에서는 window.confirm 사용
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('이 요청을 확인하시겠습니까?');
      if (confirmed) {
        console.log('[PharmacyPickupRequests] 확인 버튼 확인됨 - 상태 변경 시작');
        await updateRequestStatus(pickupId, 'ACCEPTED');
      }
    } else {
      Alert.alert('요청 확인', '이 요청을 확인하시겠습니까?', [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => console.log('[PharmacyPickupRequests] 확인 취소됨'),
        },
        {
          text: '확인',
          onPress: () => {
            console.log('[PharmacyPickupRequests] 확인 버튼 확인됨 - 상태 변경 시작');
            updateRequestStatus(pickupId, 'ACCEPTED');
          },
        },
      ]);
    }
  };

  /**
   * 요청 거절 (REQUESTED → REJECTED)
   */
  const rejectRequest = async (pickupId: number) => {
    console.log('[PharmacyPickupRequests] 거절 버튼 클릭 - pickupId:', pickupId);

    // 웹 환경에서는 window.confirm 사용
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('이 요청을 거절하시겠습니까?');
      if (confirmed) {
        console.log('[PharmacyPickupRequests] 거절 버튼 확인됨 - 상태 변경 시작');
        await updateRequestStatus(pickupId, 'REJECTED', '약국 사정으로 인한 거절');
      }
    } else {
      Alert.alert(
        '요청 거절',
        '이 요청을 거절하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => console.log('[PharmacyPickupRequests] 거절 취소됨'),
          },
          {
            text: '거절',
            style: 'destructive',
            onPress: () => {
              console.log('[PharmacyPickupRequests] 거절 버튼 확인됨 - 상태 변경 시작');
              updateRequestStatus(pickupId, 'REJECTED', '약국 사정으로 인한 거절');
            },
          },
        ]
      );
    }
  };

  /**
   * 발주 처리 (REQUESTED → WAITING)
   */
  const markAsWaiting = async (pickupId: number) => {
    console.log('[PharmacyPickupRequests] 발주 버튼 클릭 - pickupId:', pickupId);

    // 웹 환경에서는 window.confirm 사용
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('재고가 없어 발주가 필요합니다. 발주 처리하시겠습니까?');
      if (confirmed) {
        console.log('[PharmacyPickupRequests] 발주 버튼 확인됨 - 상태 변경 시작');
        await updateRequestStatus(pickupId, 'WAITING');
      }
    } else {
      Alert.alert('발주 처리', '재고가 없어 발주가 필요합니다. 발주 처리하시겠습니까?', [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => console.log('[PharmacyPickupRequests] 발주 취소됨'),
        },
        {
          text: '발주',
          onPress: () => {
            console.log('[PharmacyPickupRequests] 발주 버튼 확인됨 - 상태 변경 시작');
            updateRequestStatus(pickupId, 'WAITING');
          },
        },
      ]);
    }
  };

  /**
   * 준비 시작 (ACCEPTED → PREPARING)
   */
  const markAsPreparing = async (pickupId: number) => {
    console.log('[PharmacyPickupRequests] 준비 시작 버튼 클릭 - pickupId:', pickupId);

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('픽업 준비를 시작하시겠습니까?');
      if (confirmed) {
        console.log('[PharmacyPickupRequests] 준비 시작 버튼 확인됨 - 상태 변경 시작');
        await updateRequestStatus(pickupId, 'PREPARING');
      }
    } else {
      Alert.alert('준비 시작', '픽업 준비를 시작하시겠습니까?', [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => console.log('[PharmacyPickupRequests] 준비 시작 취소됨'),
        },
        {
          text: '시작',
          onPress: () => {
            console.log('[PharmacyPickupRequests] 준비 시작 버튼 확인됨 - 상태 변경 시작');
            updateRequestStatus(pickupId, 'PREPARING');
          },
        },
      ]);
    }
  };

  /**
   * 준비 완료 (PREPARING → READY)
   */
  const markAsReady = async (pickupId: number) => {
    console.log('[PharmacyPickupRequests] 준비 완료 버튼 클릭 - pickupId:', pickupId);

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('픽업 준비가 완료되었습니까?');
      if (confirmed) {
        console.log('[PharmacyPickupRequests] 준비 완료 버튼 확인됨 - 상태 변경 시작');
        await updateRequestStatus(pickupId, 'READY');
      }
    } else {
      Alert.alert('준비 완료', '픽업 준비가 완료되었습니까?', [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => console.log('[PharmacyPickupRequests] 준비 완료 취소됨'),
        },
        {
          text: '완료',
          onPress: () => {
            console.log('[PharmacyPickupRequests] 준비 완료 버튼 확인됨 - 상태 변경 시작');
            updateRequestStatus(pickupId, 'READY');
          },
        },
      ]);
    }
  };

  /**
   * 픽업 완료 (READY → COMPLETED)
   */
  const markAsCompleted = async (pickupId: number) => {
    console.log('[PharmacyPickupRequests] 픽업 완료 버튼 클릭 - pickupId:', pickupId);

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('픽업이 완료되었습니까?');
      if (confirmed) {
        try {
          console.log('[PharmacyPickupRequests] 픽업 완료 처리:', pickupId);
          await pickupService.completePickup(pickupId);
          await loadRequests();
          window.alert('픽업이 완료되었습니다.');
        } catch (error: any) {
          console.error('[PharmacyPickupRequests] 픽업 완료 실패:', error);
          window.alert(error.message || '픽업 완료 처리에 실패했습니다.');
        }
      }
    } else {
      Alert.alert('픽업 완료', '픽업이 완료되었습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '완료',
          onPress: async () => {
            try {
              console.log('[PharmacyPickupRequests] 픽업 완료 처리:', pickupId);
              await pickupService.completePickup(pickupId);
              await loadRequests();
              Alert.alert('성공', '픽업이 완료되었습니다.');
            } catch (error: any) {
              console.error('[PharmacyPickupRequests] 픽업 완료 실패:', error);
              Alert.alert('오류', error.message || '픽업 완료 처리에 실패했습니다.');
            }
          },
        },
      ]);
    }
  };

  /**
   * 상태 뱃지 색상
   */
  const getStatusColor = (status: PickupStatus) => {
    switch (status) {
      case 'REQUESTED':
        return '#FF8A3D';
      case 'ACCEPTED':
        return '#2196F3';
      case 'PREPARING':
        return '#9C27B0';
      case 'READY':
        return '#4CAF50';
      case 'COMPLETED':
        return '#9E9E9E';
      case 'CANCELED':
      case 'REJECTED':
        return '#F44336';
      case 'WAITING':
        return '#FFB800';
      default:
        return '#999';
    }
  };

  /**
   * 상태 텍스트
   */
  const getStatusText = (status: PickupStatus) => {
    switch (status) {
      case 'REQUESTED':
        return '요청됨';
      case 'ACCEPTED':
        return '확인됨';
      case 'PREPARING':
        return '준비 중';
      case 'READY':
        return '픽업 가능';
      case 'COMPLETED':
        return '완료';
      case 'CANCELED':
        return '취소됨';
      case 'REJECTED':
        return '거절됨';
      case 'WAITING':
        return '대기 중';
      default:
        return '알 수 없음';
    }
  };

  /**
   * 필터링된 요청 목록
   */
  const getFilteredRequests = () => {
    switch (selectedTab) {
      case 'requested':
        // 요청됨: 새로운 요청
        return requests.filter(req => req.status === 'REQUESTED');
      case 'inProgress':
        // 진행중: 확인됨, 준비중, 픽업가능
        return requests.filter(req =>
          ['ACCEPTED', 'PREPARING', 'READY'].includes(req.status)
        );
      case 'waiting':
        // 대기중: 발주대기
        return requests.filter(req => req.status === 'WAITING');
      case 'completed':
        // 픽업완료
        return requests.filter(req => req.status === 'COMPLETED');
      case 'rejected':
        // 거절됨/취소됨
        return requests.filter(req =>
          ['REJECTED', 'CANCELED'].includes(req.status)
        );
      case 'all':
      default:
        return requests;
    }
  };

  const filteredRequests = getFilteredRequests();

  // 각 탭별 개수 계산
  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'requested':
        return requests.filter(req => req.status === 'REQUESTED').length;
      case 'inProgress':
        return requests.filter(req =>
          ['ACCEPTED', 'PREPARING', 'READY'].includes(req.status)
        ).length;
      case 'waiting':
        return requests.filter(req => req.status === 'WAITING').length;
      case 'completed':
        return requests.filter(req => req.status === 'COMPLETED').length;
      case 'rejected':
        return requests.filter(req =>
          ['REJECTED', 'CANCELED'].includes(req.status)
        ).length;
      case 'all':
      default:
        return requests.length;
    }
  };

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}/${day} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  /**
   * 요청 카드 렌더링
   */
  const renderRequestCard = (request: PickupRequest) => (
    <View key={request.pickupId} style={styles.requestCard}>
      {/* 헤더 */}
      <View style={styles.requestHeader}>
        <View style={styles.requestHeaderLeft}>
          <Text style={styles.requestNumber}>#{request.pickupId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
            <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
          </View>
        </View>
        <Text style={styles.requestTime}>{formatDate(request.requestedAt)}</Text>
      </View>

      {/* 사용자 정보 */}
      {request.customer && (
        <View style={styles.userInfo}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.userName}>{request.customer.nickname}</Text>
          {request.customer.email && (
            <Text style={styles.userPhone}>{request.customer.email}</Text>
          )}
        </View>
      )}

      {/* 상품 목록 */}
      {request.products && request.products.length > 0 && (
        <View style={styles.productsContainer}>
          <Text style={styles.productsTitle}>요청 상품</Text>
          {request.products.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>• {product.productName}</Text>
                {product.petName && (
                  <Text style={styles.productPetName}>({product.petName})</Text>
                )}
              </View>
              <Text style={styles.productQuantity}>x{product.quantity}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 총액 */}
      {request.totalAmount && (
        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmountLabel}>총액</Text>
          <Text style={styles.totalAmountValue}>{request.totalAmount.toLocaleString()}원</Text>
        </View>
      )}

      {/* 고객 메모 */}
      {request.customerMemo && (
        <View style={styles.notesContainer}>
          <Ionicons name="chatbox-outline" size={14} color="#666" />
          <Text style={styles.notesText}>{request.customerMemo}</Text>
        </View>
      )}

      {/* 액션 버튼 */}
      <View style={styles.actionsContainer}>
        {request.status === 'REQUESTED' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => confirmRequest(request.pickupId)}
            >
              <Text style={styles.actionButtonText}>확인</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => rejectRequest(request.pickupId)}
            >
              <Text style={styles.actionButtonText}>거절</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.waitingButton]}
              onPress={() => markAsWaiting(request.pickupId)}
            >
              <Text style={styles.actionButtonText}>발주</Text>
            </TouchableOpacity>
          </>
        )}
        {request.status === 'ACCEPTED' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.preparingButton]}
            onPress={() => markAsPreparing(request.pickupId)}
          >
            <Text style={styles.actionButtonText}>준비 시작</Text>
          </TouchableOpacity>
        )}
        {request.status === 'WAITING' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => updateRequestStatus(request.pickupId, 'ACCEPTED')}
          >
            <Text style={styles.actionButtonText}>재고 입고</Text>
          </TouchableOpacity>
        )}
        {request.status === 'PREPARING' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.readyButton]}
            onPress={() => markAsReady(request.pickupId)}
          >
            <Text style={styles.actionButtonText}>준비 완료</Text>
          </TouchableOpacity>
        )}
        {request.status === 'READY' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => markAsCompleted(request.pickupId)}
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'requested' && styles.tabActive]}
          onPress={() => setSelectedTab('requested')}
        >
          <Text style={[styles.tabText, selectedTab === 'requested' && styles.tabTextActive]}>
            요청됨 ({getTabCount('requested')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'inProgress' && styles.tabActive]}
          onPress={() => setSelectedTab('inProgress')}
        >
          <Text style={[styles.tabText, selectedTab === 'inProgress' && styles.tabTextActive]}>
            진행중 ({getTabCount('inProgress')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'waiting' && styles.tabActive]}
          onPress={() => setSelectedTab('waiting')}
        >
          <Text style={[styles.tabText, selectedTab === 'waiting' && styles.tabTextActive]}>
            대기중 ({getTabCount('waiting')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
            픽업완료 ({getTabCount('completed')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'rejected' && styles.tabActive]}
          onPress={() => setSelectedTab('rejected')}
        >
          <Text style={[styles.tabText, selectedTab === 'rejected' && styles.tabTextActive]}>
            거절/취소 ({getTabCount('rejected')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            전체 ({getTabCount('all')})
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
              {selectedTab === 'requested' && '새로운 요청이 없습니다'}
              {selectedTab === 'inProgress' && '진행 중인 요청이 없습니다'}
              {selectedTab === 'waiting' && '대기 중인 요청이 없습니다'}
              {selectedTab === 'completed' && '완료된 픽업이 없습니다'}
              {selectedTab === 'rejected' && '거절/취소된 요청이 없습니다'}
              {selectedTab === 'all' && '픽업 요청이 없습니다'}
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
  tabScrollView: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexGrow: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF8A3D',
  },
  tabText: {
    fontSize: 14,
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
    fontWeight: '500',
  },
  userPhone: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
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
    alignItems: 'center',
    paddingVertical: 4,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#333',
  },
  productPetName: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  totalAmountLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalAmountValue: {
    fontSize: 16,
    color: '#FF8A3D',
    fontWeight: '600',
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
  rejectButton: {
    backgroundColor: '#F44336',
  },
  waitingButton: {
    backgroundColor: '#FFB800',
  },
  preparingButton: {
    backgroundColor: '#9C27B0',
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
