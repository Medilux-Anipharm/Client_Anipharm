/**
 * Header Component
 * 공통 헤더 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  style?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightComponent,
  backgroundColor = '#FF8A3D',
  titleColor = '#fff',
  style,
}) => {
  return (
    <View style={[styles.header, { backgroundColor }, style]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={titleColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
      <Text style={[styles.headerTitle, { color: titleColor }]}>{title}</Text>
      <View style={styles.rightContainer}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});

export default Header;
