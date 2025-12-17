/**
 * ProgressBar Component
 * 진행률 표시 바 컴포넌트
 */

import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${progress}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#FF8A3D',
    borderRadius: 2,
  },
});

export default ProgressBar;
