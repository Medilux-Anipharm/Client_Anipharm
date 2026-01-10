/**
 * PickupRequestScreen
 * 픽업 요청 생성 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import pickupService from '../../services/pickup';
import { CreatePickupRequestData } from '../../types/pickup';
import { VeterinaryPharmacy } from '../../types/pharmacy';

interface PickupRequestScreenProps {
  pharmacy: VeterinaryPharmacy;
  preselectedProducts?: Array<{
    categoryId: string;
    categoryName: string;
    productName: string;
    manufacturer?: string;
  }>;
  onBack: () => void;
  onSuccess: () => void;
}

const PickupRequestScreen: React.FC<PickupRequestScreenProps> = ({
  pharmacy,
  preselectedProducts = [],
  onBack,
  onSuccess,
}) => {
  const [products, setProducts] = useState(
    preselectedProducts.map((p) => ({ ...p, quantity: 1, petName: '', petType: '' }))
  );
  const [customerMemo, setCustomerMemo] = useState('');
  const [estimatedDays, setEstimatedDays] = useState<3 | 5>(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (products.length === 0) {
      Alert.alert('알림', '픽업할 상품을 추가해주세요.');
      return;
    }

    try {
      setLoading(true);

      const requestData: CreatePickupRequestData = {
        pharmacyId: pharmacy.pharmacyId,
        products: products.map((p) => ({
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          productName: p.productName,
          manufacturer: p.manufacturer,
          quantity: p.quantity,
          petName: p.petName,
          petType: p.petType,
        })),
        customerMemo,
        estimatedDays,
      };

      await pickupService.createPickupRequest(requestData);

      Alert.alert(
        '픽업 요청 완료',
        `${pharmacy.name}에 픽업 요청이 완료되었습니다.\n약국 확인 후 알려드립니다.`,
        [{ text: '확인', onPress: onSuccess }]
      );
    } catch (error: any) {
      Alert.alert('오류', error.message || '픽업 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        categoryId: 'parasite_prevention',
        categoryName: '구충·예방 관리',
        productName: '',
        manufacturer: '',
        quantity: 1,
        petName: '',
        petType: '',
      },
    ]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>픽업 요청</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* 약국 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>픽업 약국</Text>
          <View style={styles.pharmacyCard}>
            <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
            <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
            {pharmacy.phone && (
              <View style={styles.pharmacyInfo}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.pharmacyPhone}>{pharmacy.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 상품 목록 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>픽업 상품</Text>
            <TouchableOpacity onPress={addProduct} style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={20} color="#FF8A3D" />
              <Text style={styles.addButtonText}>상품 추가</Text>
            </TouchableOpacity>
          </View>

          {products.map((product, index) => (
            <View key={index} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productIndex}>상품 {index + 1}</Text>
                <TouchableOpacity onPress={() => removeProduct(index)}>
                  <Ionicons name="close-circle" size={24} color="#999" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="상품명 (예: 넥스가드)"
                value={product.productName}
                onChangeText={(text) => updateProduct(index, 'productName', text)}
              />

              <TextInput
                style={styles.input}
                placeholder="제조사 (선택사항)"
                value={product.manufacturer}
                onChangeText={(text) => updateProduct(index, 'manufacturer', text)}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="수량"
                  keyboardType="number-pad"
                  value={product.quantity.toString()}
                  onChangeText={(text) =>
                    updateProduct(index, 'quantity', parseInt(text) || 1)
                  }
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="반려동물 이름"
                  value={product.petName}
                  onChangeText={(text) => updateProduct(index, 'petName', text)}
                />
              </View>
            </View>
          ))}
        </View>

        {/* 예상 픽업일 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>예상 픽업일</Text>
          <View style={styles.daysButtonGroup}>
            <TouchableOpacity
              style={[
                styles.daysButton,
                estimatedDays === 3 && styles.daysButtonActive,
              ]}
              onPress={() => setEstimatedDays(3)}
            >
              <Text
                style={[
                  styles.daysButtonText,
                  estimatedDays === 3 && styles.daysButtonTextActive,
                ]}
              >
                3일 후
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.daysButton,
                estimatedDays === 5 && styles.daysButtonActive,
              ]}
              onPress={() => setEstimatedDays(5)}
            >
              <Text
                style={[
                  styles.daysButtonText,
                  estimatedDays === 5 && styles.daysButtonTextActive,
                ]}
              >
                5일 후
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 요청 메모 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>요청 사항 (선택사항)</Text>
          <TextInput
            style={styles.memoInput}
            placeholder="약국에 전달할 메시지를 입력하세요"
            multiline
            numberOfLines={4}
            value={customerMemo}
            onChangeText={setCustomerMemo}
          />
        </View>

        {/* 안내 사항 */}
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={20} color="#FF8A3D" />
          <Text style={styles.noticeText}>
            약국 확인 후 픽업 가능 여부를 알려드립니다.{'\n'}
            5일 이내 약국 응답이 없으면 자동 취소됩니다.
          </Text>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '요청 중...' : '픽업 요청하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF8A3D',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  pharmacyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pharmacyPhone: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#FF8A3D',
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  daysButtonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  daysButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  daysButtonActive: {
    backgroundColor: '#FFF5EF',
    borderColor: '#FF8A3D',
  },
  daysButtonText: {
    fontSize: 14,
    color: '#666',
  },
  daysButtonTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  memoInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  notice: {
    flexDirection: 'row',
    backgroundColor: '#FFF5EF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#FF8A3D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PickupRequestScreen;
