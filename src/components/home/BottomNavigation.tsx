/**
 * BottomNavigation Component
 * 하단 네비게이션 바 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TabType = 'home' | 'community' | 'chatbot' | 'journal' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: Array<{
    key: TabType;
    label: string;
    icon: string;
    activeIcon: string;
  }> = [
    { key: 'home', label: '홈', icon: 'home-outline', activeIcon: 'home' },
    { key: 'community', label: '커뮤니티', icon: 'document-text-outline', activeIcon: 'document-text' },
    { key: 'chatbot', label: '챗봇', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
    { key: 'journal', label: '일지', icon: 'calendar-outline', activeIcon: 'calendar' },
    { key: 'profile', label: '프로필', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.navItem}
          onPress={() => onTabChange(tab.key)}
        >
          <Ionicons
            name={activeTab === tab.key ? tab.activeIcon : tab.icon}
            size={24}
            color={activeTab === tab.key ? '#FF8A3D' : '#999'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === tab.key && styles.navTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
});

export default BottomNavigation;
