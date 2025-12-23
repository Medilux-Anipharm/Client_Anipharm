/**
 * ChatbotScreen
 * 상담하기 화면 - 건강 상태 상담 / 케어 관리 상담
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatbotScreenProps {
  onSelectHealthConsult?: () => void;
  onSelectCareConsult?: () => void;
  onNavigateToInbox?: () => void;
}

const ChatbotScreen = ({ onSelectHealthConsult, onSelectCareConsult, onNavigateToInbox }: ChatbotScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>상담하기</Text>
        <TouchableOpacity
          style={styles.inboxButton}
          onPress={() => {
            console.log('[ChatbotScreen] 보관함 버튼 클릭됨');
            if (onNavigateToInbox) {
              console.log('[ChatbotScreen] onNavigateToInbox 호출');
              onNavigateToInbox();
            } else {
              console.warn('[ChatbotScreen] onNavigateToInbox가 정의되지 않음');
            }
          }}
        >
          <Ionicons name="archive-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.content}>
        {/* 제목 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>상담 모드를 선택하세요</Text>
          <Text style={styles.subtitle}>반려동물의 상태나 관리에 대해 상담할 수 있어요</Text>
        </View>

        {/* 상담 모드 카드들 */}
        <View style={styles.cardsContainer}>
          {/* 건강 상태 상담 */}
          <TouchableOpacity
            style={styles.card}
            onPress={onSelectHealthConsult}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, styles.iconHealth]}>
              <Ionicons name="medical" size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>건강 상태 상담</Text>
              <Text style={styles.cardDescription}>
                증상을 체크하면 AI가 상태를 분석해요
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>

          {/* 케어 관리 상담 */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              console.log('[케어 관리 상담] 카드 클릭됨');
              if (onSelectCareConsult) {
                console.log('[케어 관리 상담] onSelectCareConsult 호출');
                onSelectCareConsult();
              } else {
                console.warn('[케어 관리 상담] onSelectCareConsult가 정의되지 않음');
              }
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, styles.iconCare]}>
              <Ionicons name="paw" size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>케어 관리 상담</Text>
              <Text style={styles.cardDescription}>
                식이, 예방, 수술 후 케어 등을 물어보세요
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.noticeContainer}>
          <View style={styles.noticeIcon}>
            <Ionicons name="warning" size={20} color="#FF9800" />
          </View>
          <Text style={styles.noticeText}>
            본 서비스는 정보 제공이며, 진단·처방·향량 안내를 하지 않습니다.{'\n'}
            반려동물의 건강에 이상이 있다면 반드시 동물병원을 방문하세요.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    backgroundColor: '#FF8A3D',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  inboxButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  titleSection: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconHealth: {
    backgroundColor: '#FF8A3D',
  },
  iconCare: {
    backgroundColor: '#FF8A3D',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  noticeContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  noticeIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});

export default ChatbotScreen;
