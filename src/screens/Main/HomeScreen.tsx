/**
 * HomeScreen
 * 로그인 후 메인 화면 (임시)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types/auth.types';

interface HomeScreenProps {
  userData: User | null;
  onLogout: () => void;
}

const HomeScreen = ({ userData, onLogout }: HomeScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anipharm</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Ionicons name="home-outline" size={80} color="#FF8A3D" />
        <Text style={styles.welcomeText}>
          환영합니다{userData?.nickname ? `, ${userData.nickname}님!` : '!'}
        </Text>
        <Text style={styles.descriptionText}>
          메인 페이지는 현재 준비 중입니다.
        </Text>

        {/* 사용자 정보 표시 (디버깅용) */}
        {userData && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoTitle}>사용자 정보</Text>
            <Text style={styles.userInfoText}>이메일: {userData.email}</Text>
            <Text style={styles.userInfoText}>닉네임: {userData.nickname}</Text>
            <Text style={styles.userInfoText}>사용자 ID: {userData.userId}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8A3D',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  userInfoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  userInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default HomeScreen;
