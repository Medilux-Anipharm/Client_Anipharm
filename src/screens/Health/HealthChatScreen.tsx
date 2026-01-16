/**
 * HealthChatScreen
 * AI 대화 기반 상세 분석 화면
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  sendMessage,
  generateHealthAssessment,
  endConversation,
  SendMessageRequest,
} from '../../services/healthChatbot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HealthChatScreenProps {
  petId: number;
  healthCheckId: number;
  onNavigateBack: () => void;
  onComplete: (assessment: {
    triage_level: 'BLUE' | 'GREEN' | 'AMBER' | 'RED';
    recommended_actions: string[];
    health_check_summary: string;
  }) => void;
}

const HealthChatScreen = ({
  petId,
  healthCheckId,
  onNavigateBack,
  onComplete,
}: HealthChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 디버깅: healthCheckId 확인
  React.useEffect(() => {
    console.log('HealthChatScreen 마운트:', { petId, healthCheckId });
  }, [petId, healthCheckId]);

  // 초기 AI 인사 메시지
  useEffect(() => {
    const initialMessage: Message = {
      role: 'assistant',
      content:
        '안녕하세요! 반려동물의 건강 상태를 더 자세히 분석해드리겠습니다. 증상이나 상태에 대해 자세히 설명해주세요.',
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, []);

  // 메시지 추가 시 스크롤
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  /**
   * 메시지 전송
   */
  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) {
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');

    // 사용자 메시지 추가
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      setLoading(true);
      
      // health_status일 때 healthCheckId 필수 확인
      if (!healthCheckId) {
        throw new Error('건강 체크표 ID가 없습니다. 상담을 다시 시작해주세요.');
      }

      const request: SendMessageRequest = {
        petId: Number(petId),
        conversationType: 'health_status',
        healthCheckId: Number(healthCheckId),
        message: userMessage,
      };

      console.log('메시지 전송 요청:', request);

      const response = await sendMessage(request);

      if (response.success && response.data) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.message || '메시지 전송에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('메시지 전송 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: error.config?.data,
      });
      // 백엔드 에러 메시지 상세 로깅
      if (error.response?.data) {
        console.error('백엔드 응답 데이터:', JSON.stringify(error.response.data, null, 2));
      }
      let errorMessage = error.response?.data?.message || error.message || '메시지 전송에 실패했습니다.';
      
      // OpenAI API 키 관련 에러 메시지 개선
      if (errorMessage.includes('OPENAI_API_KEY') || errorMessage.includes('OpenAI API')) {
        errorMessage = 'AI 챗봇 서비스가 설정되지 않았습니다.\n\n서버 관리자에게 문의하시거나, 잠시 후 다시 시도해주세요.';
      }
      
      console.error('백엔드 에러 메시지:', errorMessage);
      Alert.alert(
        '오류',
        errorMessage
      );
      // 실패한 사용자 메시지 제거
      setMessages((prev) => prev.filter((msg) => msg !== newUserMessage));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 건강 평가 생성 (트리아지)
   */
  const handleGenerateAssessment = async () => {
    console.log('상담 결과 받기 버튼 클릭됨');
    console.log('현재 상태:', { assessing, loading, petId, healthCheckId });

    if (assessing) {
      console.log('이미 평가 중이므로 중단');
      return;
    }

    try {
      setAssessing(true);
      console.log('트리아지 평가 요청 시작');

      const response = await generateHealthAssessment({
        petId: Number(petId),
        healthCheckId: Number(healthCheckId),
      });

      console.log('트리아지 평가 응답:', response);

      if (response.success && response.data) {
        console.log('평가 성공, 결과 화면으로 이동:', response.data);
        onComplete(response.data);
      } else {
        throw new Error(response.message || '건강 평가 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('건강 평가 생성 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert(
        '오류',
        error.response?.data?.message ||
          error.message ||
          '건강 평가 생성에 실패했습니다. 판단이 어렵습니다. 가까운 병원에 문의하세요.'
      );
    } finally {
      setAssessing(false);
    }
  };

  /**
   * 대화 종료 모달 열기
   */
  const handleEndConversation = () => {
    setShowEndModal(true);
  };

  /**
   * 대화 종료 및 저장
   */
  const handleConfirmEnd = async () => {
    setShowEndModal(false);
    try {
      setEnding(true);
      const response = await endConversation({
        petId: Number(petId),
        conversationType: 'health_status',
        healthCheckId: Number(healthCheckId),
        saveReport: true,
      });

      if (response.success) {
        Alert.alert('알림', '대화 내용이 저장되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              onNavigateBack();
            },
          },
        ]);
      } else {
        throw new Error(response.message || '저장에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('대화 종료 실패:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message ||
          error.message ||
          '저장에 실패했습니다.'
      );
    } finally {
      setEnding(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>건강 상태 상담</Text>
        <TouchableOpacity
          onPress={handleEndConversation}
          style={styles.endButton}
          disabled={ending}
        >
          {ending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="close" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* 메시지 영역 */}
      <ScrollView
        ref={scrollViewRef}
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
        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color="#FF8A3D" />
          </View>
        )}
      </ScrollView>

      {/* 하단 액션 버튼 */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.assessButton, assessing && styles.assessButtonDisabled]}
          onPress={() => {
            console.log('TouchableOpacity onPress 호출됨');
            console.log('disabled 상태:', assessing || loading);
            handleGenerateAssessment();
          }}
          disabled={assessing || loading}
          activeOpacity={0.7}
        >
          {assessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="medical" size={20} color="#fff" />
              <Text style={styles.assessButtonText}>상담 결과 받기</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="증상을 입력해주세요"
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!loading && !assessing}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* 대화 종료 확인 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showEndModal}
        onRequestClose={() => setShowEndModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF8A3D" />
            </View>
            <Text style={styles.modalTitle}>상담을 종료하시겠습니까?</Text>
            <Text style={styles.modalMessage}>상담 중인 모든 내용은 초기화됩니다.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEndModal(false)}
                disabled={ending}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmEnd}
                disabled={ending}
              >
                {ending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>종료</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  endButton: {
    padding: 4,
    width: 32,
    height: 32,
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
  loadingWrapper: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    zIndex: 10,
    elevation: 10,
  },
  assessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8A3D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  assessButtonDisabled: {
    backgroundColor: '#FFD4B8',
  },
  assessButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#F9F9F9',
    color: '#000',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF8A3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#FFD4B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FF8A3D',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default HealthChatScreen;

