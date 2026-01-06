/**
 * PickupPharmacySelectScreen
 * 픽업 약국 선택 화면 (더미 데이터)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PickupProduct } from '../../types/pickup';

interface SelectedProduct {
  product: PickupProduct;
  quantity: number;
}

interface PickupPharmacySelectScreenProps {
  selectedProducts: SelectedProduct[];
  onNavigateBack: () => void;
  onConfirmPickup?: (pharmacyId: string) => void;
  onNavigateToRequestConfirm?: (pharmacy: DummyPharmacy) => void;
}

// 더미 약국 데이터
export interface DummyPharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  openHours: string;
  isOpen: boolean;
  hasStock: boolean;
}

const dummyPharmacies: DummyPharmacy[] = [
  {
    id: 'pharmacy_1',
    name: '메디팜 동물약국',
    address: '서울 강남구 테헤란로 123',
    distance: '0.5km',
    phone: '02-1234-5678',
    openHours: '09:00 - 21:00',
    isOpen: true,
    hasStock: true,
  },
  {
    id: 'pharmacy_2',
    name: '펫케어 약국',
    address: '서울 강남구 역삼동 456-7',
    distance: '1.2km',
    phone: '02-2345-6789',
    openHours: '10:00 - 20:00',
    isOpen: true,
    hasStock: true,
  },
  {
    id: 'pharmacy_3',
    name: '애니팜 약국',
    address: '서울 서초구 서초대로 789',
    distance: '2.3km',
    phone: '02-3456-7890',
    openHours: '09:00 - 19:00',
    isOpen: false,
    hasStock: true,
  },
  {
    id: 'pharmacy_4',
    name: '반려동물 헬스케어 약국',
    address: '서울 송파구 올림픽로 321',
    distance: '3.5km',
    phone: '02-4567-8901',
    openHours: '08:00 - 22:00',
    isOpen: true,
    hasStock: false,
  },
];

const PickupPharmacySelectScreen: React.FC<PickupPharmacySelectScreenProps> = ({
  selectedProducts,
  onNavigateBack,
  onConfirmPickup,
  onNavigateToRequestConfirm,
}) => {
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);

  // PICK-11: 약국 선택 시 픽업 요청 확인 페이지로 이동
  const handleConfirmPickup = () => {
    if (!selectedPharmacy) {
      Alert.alert('알림', '약국을 선택해주세요.');
      return;
    }

    const pharmacy = dummyPharmacies.find(p => p.id === selectedPharmacy);
    if (!pharmacy) return;

    // 픽업 요청 확인 페이지로 이동
    if (onNavigateToRequestConfirm) {
      onNavigateToRequestConfirm(pharmacy);
    } else {
      // 기존 동작 유지 (호환성)
      if (!pharmacy.isOpen) {
        Alert.alert('알림', '현재 영업시간이 아닙니다.');
        return;
      }

      if (!pharmacy.hasStock) {
        Alert.alert('알림', '해당 약국에 재고가 없습니다. 다른 약국을 선택해주세요.');
        return;
      }

      Alert.alert(
        '픽업 예약 확인',
        `${pharmacy.name}에서 픽업하시겠습니까?\n\n선택한 약품: ${selectedProducts.length}개`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            onPress: () => {
              if (onConfirmPickup) {
                onConfirmPickup(selectedPharmacy);
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

  // 약국 카드 렌더링
  const renderPharmacyCard = (pharmacy: DummyPharmacy) => {
    const isSelected = selectedPharmacy === pharmacy.id;

    return (
      <TouchableOpacity
        key={pharmacy.id}
        style={[
          styles.pharmacyCard,
          isSelected && styles.pharmacyCardSelected,
          !pharmacy.isOpen && styles.pharmacyCardClosed,
        ]}
        onPress={() => setSelectedPharmacy(pharmacy.id)}
        disabled={!pharmacy.isOpen}
      >
        {/* 선택 체크 */}
        <View style={styles.pharmacyHeader}>
          <View style={styles.pharmacyInfo}>
            <Text style={[
              styles.pharmacyName,
              !pharmacy.isOpen && styles.textDisabled,
            ]}>
              {pharmacy.name}
            </Text>
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={12} color="#666" />
              <Text style={styles.distanceText}>{pharmacy.distance}</Text>
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
          <Text style={[styles.pharmacyDetailText, !pharmacy.isOpen && styles.textDisabled]}>
            {pharmacy.address}
          </Text>
        </View>

        {/* 전화번호 */}
        <View style={styles.pharmacyDetail}>
          <Ionicons name="call" size={14} color="#666" />
          <Text style={[styles.pharmacyDetailText, !pharmacy.isOpen && styles.textDisabled]}>
            {pharmacy.phone}
          </Text>
        </View>

        {/* 영업시간 */}
        <View style={styles.pharmacyDetail}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={[styles.pharmacyDetailText, !pharmacy.isOpen && styles.textDisabled]}>
            {pharmacy.openHours}
          </Text>
        </View>

        {/* 상태 배지 */}
        <View style={styles.statusBadges}>
          {pharmacy.isOpen ? (
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>영업중</Text>
            </View>
          ) : (
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>영업종료</Text>
            </View>
          )}

          {pharmacy.hasStock ? (
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>재고 있음</Text>
            </View>
          ) : (
            <View style={styles.noStockBadge}>
              <Text style={styles.noStockBadgeText}>약국 확인 필요</Text>
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

        {/* 약국 리스트 */}
        <Text style={styles.sectionTitle}>주변 약국</Text>
        {dummyPharmacies.map(renderPharmacyCard)}
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
});

export default PickupPharmacySelectScreen;
