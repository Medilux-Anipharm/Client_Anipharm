/**
 * ViewModeToggle Component
 * 지도/리스트 뷰 모드 토글 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ViewModeToggleProps {
  mode: 'map' | 'list';
  onModeChange: (mode: 'map' | 'list') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mode === 'map' && styles.buttonActive]}
        onPress={() => onModeChange('map')}
      >
        <Ionicons name="map-outline" size={18} color={mode === 'map' ? '#FF8A3D' : '#666'} />
        <Text style={[styles.text, mode === 'map' && styles.textActive]}>
          지도
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, mode === 'list' && styles.buttonActive]}
        onPress={() => onModeChange('list')}
      >
        <Ionicons name="list-outline" size={18} color={mode === 'list' ? '#FF8A3D' : '#666'} />
        <Text style={[styles.text, mode === 'list' && styles.textActive]}>
          리스트
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  buttonActive: {
    backgroundColor: '#FFF5EF',
  },
  text: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  textActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
});

export default ViewModeToggle;
