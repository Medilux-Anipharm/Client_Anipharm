/**
 * PickupProductListScreen
 * 픽업 약품 선택 화면 - 카테고리별 약품 리스트 및 선택
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PickupCategory, PickupProduct } from '../../types/pickup';
import { pickupCategories } from '../../data/pickupCategories';

interface PickupProductListScreenProps {
  categoryId: string;
  onNavigateBack: () => void;
  onNavigateToPharmacySelect: (selectedProducts: SelectedProduct[]) => void;
}

interface SelectedProduct {
  product: PickupProduct;
  quantity: number;
}

const PickupProductListScreen: React.FC<PickupProductListScreenProps> = ({
  categoryId: initialCategoryId,
  onNavigateBack,
  onNavigateToPharmacySelect,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Map<string, SelectedProduct>>(new Map());
  const [loadingError, setLoadingError] = useState(false);

  // 현재 선택된 카테고리
  const currentCategory = pickupCategories.find(c => c.id === selectedCategoryId);

  // 검색 필터링된 약품 리스트
  const filteredProducts = currentCategory?.products.filter(product =>
    searchQuery.trim() === '' ||
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.nameKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // 선택된 약품 개수
  const selectedCount = selectedProducts.size;

  // 카테고리 변경 핸들러
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery('');
  };

  // 약품 선택/해제 토글
  const handleProductToggle = (product: PickupProduct) => {
    const newSelected = new Map(selectedProducts);

    if (newSelected.has(product.id)) {
      newSelected.delete(product.id);
    } else {
      newSelected.set(product.id, { product, quantity: 1 });
    }

    setSelectedProducts(newSelected);
  };

  // 수량 변경
  const handleQuantityChange = (productId: string, delta: number) => {
    const newSelected = new Map(selectedProducts);
    const item = newSelected.get(productId);

    if (item) {
      const newQuantity = item.quantity + delta;

      if (newQuantity > 3) {
        Alert.alert('알림', '최대 수량은 3개입니다.');
        return;
      }

      if (newQuantity < 1) {
        return;
      }

      newSelected.set(productId, { ...item, quantity: newQuantity });
      setSelectedProducts(newSelected);
    }
  };

  // 픽업하기 버튼
  const handlePickupPress = () => {
    if (selectedProducts.size === 0) {
      Alert.alert('알림', '약품을 선택해주세요.');
      return;
    }

    const productsArray = Array.from(selectedProducts.values());
    onNavigateToPharmacySelect(productsArray);
  };

  // 약품 카드 렌더링
  const renderProductCard = (product: PickupProduct) => {
    const isSelected = selectedProducts.has(product.id);
    const selectedItem = selectedProducts.get(product.id);

    return (
      <View key={product.id} style={styles.productCard}>
        {/* 상단: 약품 정보 */}
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.nameKo}</Text>
            <Text style={styles.productNameEn}>{product.name}</Text>
            <Text style={styles.productManufacturer}>{product.manufacturer}</Text>
          </View>

          {/* 선택 토글 */}
          <TouchableOpacity
            style={[styles.toggleButton, isSelected && styles.toggleButtonActive]}
            onPress={() => handleProductToggle(product)}
          >
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={28}
              color={isSelected ? '#FF8A3D' : '#CCC'}
            />
          </TouchableOpacity>
        </View>

        {/* 용도 */}
        <View style={styles.productPurpose}>
          <Ionicons name="medical" size={14} color="#666" />
          <Text style={styles.productPurposeText}>{product.purpose}</Text>
        </View>

        {/* 주의사항 */}
        {(product.note || product.safetyInfo) && (
          <View style={styles.productNote}>
            <Ionicons name="information-circle" size={14} color="#FF8A3D" />
            <Text style={styles.productNoteText}>
              {product.safetyInfo || product.note || '상세는 약사 상담 권장'}
            </Text>
          </View>
        )}

        {/* 픽업 가능 배지 */}
        <View style={styles.availableBadge}>
          <Text style={styles.availableBadgeText}>픽업 가능</Text>
        </View>

        {/* 수량 조절 (선택된 경우만) */}
        {isSelected && selectedItem && (
          <View style={styles.quantityControl}>
            <Text style={styles.quantityLabel}>수량</Text>
            <View style={styles.quantityButtons}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(product.id, -1)}
                disabled={selectedItem.quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={selectedItem.quantity <= 1 ? '#CCC' : '#666'}
                />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{selectedItem.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(product.id, 1)}
                disabled={selectedItem.quantity >= 3}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={selectedItem.quantity >= 3 ? '#CCC' : '#666'}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // 로딩 에러 처리
  if (loadingError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>카테고리를 불러올 수 없습니다</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setLoadingError(false)}
          >
            <Text style={styles.retryButtonText}>재시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>픽업 약품 선택</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 카테고리 탭 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {pickupCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategoryId === category.id && styles.categoryTabActive,
            ]}
            onPress={() => handleCategoryChange(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={14}
              color={selectedCategoryId === category.id ? '#FF8A3D' : '#666'}
            />
            <Text
              style={[
                styles.categoryTabText,
                selectedCategoryId === category.id && styles.categoryTabTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="약품명으로 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* 약품 리스트 */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medkit-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>
              {searchQuery ? '일치하는 약품이 없습니다' : '현재 준비 중인 카테고리입니다'}
            </Text>
            {!searchQuery && (
              <Text style={styles.emptySubText}>다른 카테고리를 선택해주세요</Text>
            )}
          </View>
        ) : (
          filteredProducts.map(renderProductCard)
        )}
      </ScrollView>

      {/* 하단 고정 요약 바 */}
      {selectedCount > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>선택한 약품 ({selectedCount}개)</Text>
          </View>

          <ScrollView
            style={styles.summaryList}
            showsVerticalScrollIndicator={false}
          >
            {Array.from(selectedProducts.values()).map((item) => (
              <View key={item.product.id} style={styles.summaryItem}>
                <Text style={styles.summaryProductName} numberOfLines={1}>
                  {item.product.nameKo}
                </Text>
                <Text style={styles.summaryProductQuantity}>
                  {item.quantity}개
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.pickupButton}
            onPress={handlePickupPress}
          >
            <Text style={styles.pickupButtonText}>이 약품으로 픽업하기</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
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
  categoryTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  categoryTabActive: {
    backgroundColor: '#FFF5ED',
  },
  categoryTabText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  categoryTabTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productNameEn: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  productManufacturer: {
    fontSize: 12,
    color: '#666',
  },
  toggleButton: {
    padding: 4,
  },
  toggleButtonActive: {
    // Active state handled by icon color
  },
  productPurpose: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPurposeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  productNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5ED',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  productNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#FF8A3D',
    marginLeft: 6,
    lineHeight: 16,
  },
  availableBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  availableBadgeText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
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
    maxHeight: 280,
  },
  summaryHeader: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  summaryList: {
    maxHeight: 120,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 6,
  },
  summaryProductName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 12,
  },
  summaryProductQuantity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF8A3D',
  },
  summaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8A3D',
  },
  pickupButton: {
    flexDirection: 'row',
    backgroundColor: '#FF8A3D',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF8A3D',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PickupProductListScreen;
