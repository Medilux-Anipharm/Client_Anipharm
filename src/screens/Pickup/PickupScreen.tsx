/**
 * PickupScreen
 * 픽업 메인 화면 - 픽업 가능한 의약품 카테고리 표시
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PickupCategory } from '../../types/pickup';
import { pickupCategories } from '../../data/pickupCategories';

interface PickupScreenProps {
  onNavigateToCategoryDetail?: (categoryId: string) => void;
  onNavigateToHistory?: () => void;
}

const PickupScreen: React.FC<PickupScreenProps> = ({
  onNavigateToCategoryDetail,
  onNavigateToHistory,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 카테고리 카드 클릭 핸들러
  const handleCategoryPress = (category: PickupCategory) => {
    setSelectedCategory(category.id);

    // 경고 메시지가 있는 카테고리는 알림 표시
    if (category.warningMessage) {
      Alert.alert(
        '주의사항',
        category.warningMessage,
        [
          {
            text: '확인',
            onPress: () => {
              if (onNavigateToCategoryDetail) {
                onNavigateToCategoryDetail(category.id);
              }
            },
          },
        ]
      );
    } else {
      if (onNavigateToCategoryDetail) {
        onNavigateToCategoryDetail(category.id);
      }
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8A3D" />
          <Text style={styles.loadingText}>카테고리를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>픽업</Text>
          <Text style={styles.headerSubtitle}>필요한 의약품을 선택하세요</Text>
        </View>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={onNavigateToHistory}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={20} color="#FF8A3D" />
          <Text style={styles.historyButtonText}>히스토리</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 안내 메시지 */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#FF8A3D" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>픽업 서비스 안내</Text>
            <Text style={styles.infoText}>
              간편하게 필요한 의약품을 선택하고 픽업 예약할 수 있습니다.
            </Text>
          </View>
        </View>

        {/* 카테고리 목록 */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>픽업 가능 카테고리</Text>

          {pickupCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected,
              ]}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons
                  name={category.icon as any}
                  size={32}
                  color="#FF8A3D"
                />
              </View>

              <View style={styles.categoryContent}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>

                {category.warningMessage && (
                  <View style={styles.warningBadge}>
                    <Ionicons name="warning" size={12} color="#FF6B6B" />
                    <Text style={styles.warningBadgeText}>주의사항 있음</Text>
                  </View>
                )}

                <View style={styles.productCount}>
                  <Text style={styles.productCountText}>
                    {category.products.length}개 상품
                  </Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* 하단 안내 */}
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>
            ※ 모든 의약품은 수의사 처방이 필요한 경우가 있습니다.
          </Text>
          <Text style={styles.bottomInfoText}>
            ※ 심각한 증상이 있는 경우 반드시 병원 방문을 권장합니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
    gap: 4,
  },
  historyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF8A3D',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF5ED',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: '#FF8A3D',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  warningBadgeText: {
    fontSize: 11,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '500',
  },
  productCount: {
    marginTop: 4,
  },
  productCountText: {
    fontSize: 12,
    color: '#999',
  },
  bottomInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  bottomInfoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
});

export default PickupScreen;
