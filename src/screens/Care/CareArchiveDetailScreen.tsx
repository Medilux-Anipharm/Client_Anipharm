/**
 * CareArchiveDetailScreen
 * 케어 관리 모드 보관함 상세 화면 (읽기 전용)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getConversationScript } from '../../services/healthChatbot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CareArchiveDetailScreenProps {
  petId: number;
  conversationId: number;
  onNavigateBack: () => void;
}

const CareArchiveDetailScreen = ({
  petId,
  conversationId,
  onNavigateBack,
}: CareArchiveDetailScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const response = await getConversationScript(
        petId,
        'care_management',
        null,
        conversationId
      );

      if (response.success && response.data?.messages) {
        const loadedMessages: Message[] = response.data.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(),
        }));
        setMessages(loadedMessages);
      }
    } catch (error: any) {
      console.error('대화 불러오기 실패:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || error.message || '대화를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>보관된 대화</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 메시지 영역 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8A3D" />
        </View>
      ) : (
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#FF8A3D',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
});

export default CareArchiveDetailScreen;

