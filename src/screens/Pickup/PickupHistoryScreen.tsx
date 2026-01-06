import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PickupRequest, PickupStatus } from '../../types/pickup';

interface PickupHistoryScreenProps {
  onBack: () => void;
  onNavigateToDetail: (requestId: string) => void;
}

// 더미 픽업 내역 데이터 (PICK-18)
const dummyPickupHistory: PickupRequest[] = [
  {
    id: 'REQ-2024-001',
    status: 'ready',
    requestDate: '2024-01-06 13:30',
    pharmacy: {
      id: 'pharmacy_1',
      name: '우리동물약국 강남점',
      phone: '02-1234-5678',
      address: '서울시 강남구 테헤란로 123',
    },
    products: [
      { name: '베토큐어 워머', quantity: 2 },
      { name: '펫닥 프로바이오틱스', quantity: 1 },
    ],
    estimatedPickupDate: '2024-01-09 (화)',
    totalQuantity: 3,
  },
  {
    id: 'REQ-2024-002',
    status: 'completed',
    requestDate: '2024-01-03 10:15',
    pharmacy: {
      id: 'pharmacy_2',
      name: '펫케어 동물약국',
      phone: '02-2345-6789',
      address: '서울시 서초구 반포대로 456',
    },
    products: [
      { name: '덴티펫 구강 케어', quantity: 1 },
      { name: '피부 진정 스프레이', quantity: 1 },
    ],
    completedDate: '2024-01-04 14:20',
    totalQuantity: 2,
  },
  {
    id: 'REQ-2024-003',
    status: 'pending',
    requestDate: '2024-01-02 16:45',
    pharmacy: {
      id: 'pharmacy_1',
      name: '우리동물약국 강남점',
      phone: '02-1234-5678',
      address: '서울시 강남구 테헤란로 123',
    },
    products: [
      { name: '관절 영양제', quantity: 1 },
    ],
    estimatedPickupDate: '2024-01-08 (월)',
    totalQuantity: 1,
  },
  {
    id: 'REQ-2024-004',
    status: 'completed',
    requestDate: '2023-12-28 09:20',
    pharmacy: {
      id: 'pharmacy_3',
      name: '애니멀 헬스케어 약국',
      phone: '02-3456-7890',
      address: '서울시 강동구 천호대로 789',
    },
    products: [
      { name: '구충제', quantity: 2 },
      { name: '심장사상충 예방약', quantity: 1 },
    ],
    completedDate: '2023-12-29 15:30',
    totalQuantity: 3,
  },
];

const PickupHistoryScreen: React.FC<PickupHistoryScreenProps> = ({
  onBack,
  onNavigateToDetail,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'completed'>('all');

  // 상태별 필터링
  const filteredHistory = dummyPickupHistory.filter((request) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return request.status === 'pending' || request.status === 'ready';
    if (selectedTab === 'completed') return request.status === 'completed';
    return true;
  });

  // 상태 정보 반환
  const getStatusInfo = (status: PickupStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: 'time-outline' as const,
          color: '#FF9800',
          text: '준비 중',
          bgColor: '#FFF3E0',
        };
      case 'ready':
        return {
          icon: 'checkmark-circle-outline' as const,
          color: '#4CAF50',
          text: '픽업 가능',
          bgColor: '#E8F5E9',
        };
      case 'completed':
        return {
          icon: 'checkbox-outline' as const,
          color: '#2196F3',
          text: '완료',
          bgColor: '#E3F2FD',
        };
      case 'cancelled':
        return {
          icon: 'close-circle-outline' as const,
          color: '#999',
          text: '취소',
          bgColor: '#F5F5F5',
        };
      default:
        return {
          icon: 'help-circle-outline' as const,
          color: '#999',
          text: '확인 중',
          bgColor: '#F5F5F5',
        };
    }
  };

  // 픽업 내역 카드 렌더링
  const renderHistoryCard = (request: PickupRequest) => {
    const statusInfo = getStatusInfo(request.status);

    return (
      <TouchableOpacity
        key={request.id}
        style={styles.card}
        onPress={() => onNavigateToDetail(request.id)}
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
          <Text style={styles.requestId}>{request.id}</Text>
        </View>

        {/* 약국 정보 */}
        <View style={styles.pharmacyInfo}>
          <Ionicons name="storefront-outline" size={18} color="#666" />
          <Text style={styles.pharmacyName}>{request.pharmacy.name}</Text>
        </View>

        {/* 약품 정보 */}
        <View style={styles.productsInfo}>
          <Text style={styles.productsLabel}>요청 약품</Text>
          <Text style={styles.productsText}>
            {request.products.map(p => p.name).join(', ')}
          </Text>
          <Text style={styles.quantityText}>총 {request.totalQuantity}개</Text>
        </View>

        {/* 하단: 날짜 정보 */}
        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={14} color="#999" />
            <Text style={styles.dateText}>요청일: {request.requestDate}</Text>
          </View>
          {request.status === 'completed' && request.completedDate && (
            <View style={styles.dateInfo}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#4CAF50" />
              <Text style={styles.dateText}>완료일: {request.completedDate}</Text>
            </View>
          )}
          {(request.status === 'pending' || request.status === 'ready') && request.estimatedPickupDate && (
            <View style={styles.dateInfo}>
              <Ionicons name="time-outline" size={14} color="#FF9800" />
              <Text style={styles.dateText}>예상 픽업: {request.estimatedPickupDate}</Text>
            </View>
          )}
        </View>

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
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>픽업 내역이 없습니다</Text>
            <Text style={styles.emptySubText}>
              약품을 픽업하면 내역이 여기에 표시됩니다
            </Text>
          </View>
        ) : (
          filteredHistory.map(renderHistoryCard)
        )}
      </ScrollView>
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
});

export default PickupHistoryScreen;
