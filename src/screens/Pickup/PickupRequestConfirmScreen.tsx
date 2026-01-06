import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SelectedProduct } from '../../types/pickup';

interface DummyPharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  openHours: string;
  isOpen: boolean;
  hasStock: boolean;
}

interface PickupRequestConfirmScreenProps {
  selectedProducts: SelectedProduct[];
  selectedPharmacy: DummyPharmacy;
  onBack: () => void;
  onConfirm: () => void;
}

const PickupRequestConfirmScreen: React.FC<PickupRequestConfirmScreenProps> = ({
  selectedProducts,
  selectedPharmacy,
  onBack,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 총 수량 계산
  const totalQuantity = selectedProducts.reduce((sum, item) => sum + item.quantity, 0);

  // 픽업 요청 제출 (PICK-14)
  const handleSubmitRequest = async () => {
    try {
      setIsSubmitting(true);

      // TODO: 실제 API 호출로 대체
      // const response = await api.submitPickupRequest({
      //   products: selectedProducts,
      //   pharmacyId: selectedPharmacy.id,
      // });

      // 더미 데이터로 1초 지연
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSubmitting(false);

      // 성공 시 픽업 상태 확인 페이지로 바로 이동 (PICK-15)
      onConfirm();
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert(
        '요청 실패',
        '픽업 요청 중 오류가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>픽업 요청 확인</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* PICK-12: 픽업 요청 요약 - 선택한 약품 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>선택한 약품</Text>
          <View style={styles.card}>
            {selectedProducts.map((item, index) => (
              <View key={item.product.id}>
                <View style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.product.nameKo}</Text>
                    <Text style={styles.productNameEn}>{item.product.name}</Text>
                  </View>
                  <Text style={styles.productQuantity}>{item.quantity}개</Text>
                </View>
                {index < selectedProducts.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>총 수량</Text>
              <Text style={styles.totalValue}>{totalQuantity}개</Text>
            </View>
          </View>
        </View>

        {/* PICK-12: 픽업 요청 요약 - 약국 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>픽업 약국</Text>
          <View style={styles.card}>
            <View style={styles.pharmacyHeader}>
              <Text style={styles.pharmacyName}>{selectedPharmacy.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>픽업 가능 약국</Text>
              </View>
            </View>

            <View style={styles.pharmacyDetail}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.pharmacyDetailText}>{selectedPharmacy.address}</Text>
            </View>

            <View style={styles.pharmacyDetail}>
              <Ionicons name="navigate-outline" size={16} color="#666" />
              <Text style={styles.pharmacyDetailText}>{selectedPharmacy.distance}</Text>
            </View>

            <View style={styles.pharmacyDetail}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.pharmacyDetailText}>{selectedPharmacy.phone}</Text>
            </View>

            <View style={styles.pharmacyDetail}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.pharmacyDetailText}>{selectedPharmacy.openHours}</Text>
            </View>

            {/* PICK-10: 재고 상태 안내 */}
            <View style={styles.stockInfo}>
              <Ionicons
                name={selectedPharmacy.hasStock ? 'checkmark-circle' : 'time'}
                size={20}
                color={selectedPharmacy.hasStock ? '#4CAF50' : '#FF9800'}
              />
              <Text style={[
                styles.stockText,
                selectedPharmacy.hasStock ? styles.stockAvailable : styles.stockOrder
              ]}>
                {selectedPharmacy.hasStock ? '즉시 픽업 가능' : '발주 후 픽업'}
              </Text>
            </View>
          </View>
        </View>

        {/* PICK-13: 픽업 방식 안내 */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>픽업 방식 안내</Text>
            <Text style={styles.infoText}>
              • 재고가 있는 약품은 즉시 픽업이 가능합니다{'\n'}
              • 재고가 없는 약품은 주 1회 발주 후 픽업하실 수 있습니다{'\n'}
              • 픽업 준비가 완료되면 알림을 보내드립니다
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* PICK-14: 픽업 요청 제출 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitRequest}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>픽업 요청하기</Text>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productNameEn: {
    fontSize: 13,
    color: '#999',
  },
  productQuantity: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF8A3D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#E5E5E5',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8A3D',
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pharmacyName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#FFF5ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF8A3D',
  },
  pharmacyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pharmacyDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  stockText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  stockAvailable: {
    color: '#4CAF50',
  },
  stockOrder: {
    color: '#FF9800',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
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
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#FF8A3D',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default PickupRequestConfirmScreen;
