/**
 * FilterButtons Component
 * 카테고리 필터 버튼 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MapCategory } from '../../types/map';

interface FilterButtonsProps {
  selectedCategory: MapCategory | 'all';
  onCategoryChange: (category: MapCategory | 'all') => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const categories: Array<{ key: MapCategory | 'all'; label: string }> = [
    { key: 'all', label: '전체' },
    { key: 'hospital', label: '동물병원' },
    { key: 'pharmacy', label: '동물약국' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.filterButton,
              selectedCategory === category.key && styles.filterButtonActive,
            ]}
            onPress={() => onCategoryChange(category.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === category.key && styles.filterButtonTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#FFF5EF',
    borderColor: '#FF8A3D',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
});

export default FilterButtons;
