/**
 * PickupHistoryScreen
 * 픽업 요청 내역 화면 (실제 API 연동)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PickupRequest, PickupStatus } from '../../types/pickup';
import pickupService from '../../services/pickup';

interface PickupHistoryScreenProps {
  onBack: () => void;
  onNavigateToDetail: (pickupId: number) => void;
}

const PickupHistoryScreen: React.FC<PickupHistoryScreenProps> = ({
  onBack,
  onNavigateToDetail,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPickups();
  }, [selectedTab]);

  const loadPickups = async () => {
    try {
      setLoading(true);

      let status: PickupStatus | undefined;
      if (selectedTab === 'pending') {
        // 진행중: REQUESTED, ACCEPTED, WAITING, PREPARING, READY
        status = undefined; // 전체 조회 후 필터링
      } else if (selectedTab === 'completed') {
        status = 'COMPLETED';
      }

      const data = await pickupService.getMyPickupRequests(status);

      // 진행중 탭인 경우 추가 필터링
      if (selectedTab === 'pending') {
        setPickups(data.filter(p =>
          ['REQUESTED', 'ACCEPTED', 'WAITING', 'PREPARING', 'READY'].includes(p.status)
        ));
      } else {
        setPickups(data);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '픽업 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPickups();
  };

  const handleCancel = async (pickupId: number) => {
    Alert.alert(
      '픽업 취소',
      '정말 픽업 요청을 취소하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: async () => {
            try {
              await pickupService.cancelPickupRequest(pickupId, '고객 직접 취소');
              Alert.alert('완료', '픽업 요청이 취소되었습니다.');
              loadPickups();
            } catch (error: any) {
              Alert.alert('오류', error.message || '취소에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 상태 정보 반환 (실제 상태 값 사용)
  const getStatusInfo = (status: PickupStatus) => {
    const statusText = pickupService.getStatusText(status);
    const statusColor = pickupService.getStatusColor(status);
    const statusIcon = pickupService.getStatusIcon(status);

    return {
      icon: statusIcon as any,
      color: statusColor,
      text: statusText,
      bgColor: `${statusColor}22`, // 투명도 추가
    };
  };

  // 픽업 내역 카드 렌더링
  const renderHistoryCard = (request: PickupRequest) => {
    const statusInfo = getStatusInfo(request.status);
    const canCancel = pickupService.canCancel(request.status);
    const totalQuantity = request.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;

    return (
      <TouchableOpacity
        key={request.pickupId}
        style={styles.card}
        onPress={() => onNavigateToDetail(request.pickupId)}
        activeOpacity={0.7}
      >
        {/* 상단: 상태 및 요청번호 */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <Text style={styles.requestId}>#{request.pickupId}</Text>
        </View>

        {/* 약국 정보 */}
        <View style={styles.pharmacyInfo}>
          <Ionicons name="storefront-outline" size={18} color="#666" />
          <Text style={styles.pharmacyName}>{request.pharmacy?.name}</Text>
        </View>

        {/* 약품 정보 */}
        <View style={styles.productsInfo}>
          <Text style={styles.productsLabel}>요청 약품</Text>
          <Text style={styles.productsText}>
            {request.products?.map(p => p.productName).join(', ') || ''}
          </Text>
          <Text style={styles.quantityText}>총 {totalQuantity}개</Text>
        </View>

        {/* 하단: 날짜 정보 */}
        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={14} color="#999" />
            <Text style={styles.dateText}>
              요청일: {pickupService.formatDate(request.requestedAt)}
            </Text>
          </View>
          {request.status === 'COMPLETED' && request.completedAt && (
            <View style={styles.dateInfo}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#4CAF50" />
              <Text style={styles.dateText}>
                완료일: {pickupService.formatDate(request.completedAt)}
              </Text>
            </View>
          )}
          {request.estimatedPickupDate && !['COMPLETED', 'CANCELED', 'REJECTED'].includes(request.status) && (
            <View style={styles.dateInfo}>
              <Ionicons name="time-outline" size={14} color="#FF9800" />
              <Text style={styles.dateText}>
                예상 픽업: {pickupService.formatDate(request.estimatedPickupDate)}
              </Text>
            </View>
          )}
        </View>

        {/* 취소 버튼 (취소 가능한 경우에만) */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={(e) => {
              e.stopPropagation();
              handleCancel(request.pickupId);
            }}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        )}

        {/* 화살표 아이콘 */}
        <View style={styles.arrowIcon}>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>픽업 히스토리</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 필터 탭 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.tabTextActive]}>
            진행중
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
            완료
          </Text>
        </TouchableOpacity>
      </View>

      {/* 히스토리 리스트 */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF8A3D" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {pickups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>픽업 내역이 없습니다</Text>
              <Text style={styles.emptySubText}>
                약품을 픽업하면 내역이 여기에 표시됩니다
              </Text>
            </View>
          ) : (
            pickups.map(renderHistoryCard)
          )}
        </ScrollView>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSpacer: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: '#FFF5ED',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#FF8A3D',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  requestId: {
    fontSize: 12,
    color: '#999',
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pharmacyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  productsInfo: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  productsLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  productsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF8A3D',
  },
  cardFooter: {
    gap: 6,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  arrowIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
    textAlign: 'center',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 16,
    right: 48,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
});

export default PickupHistoryScreen;
