/**
 * CareChatScreen
 * 케어 관리 모드 AI 대화 화면
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
  endConversation,
  getConversationScript,
  getConversationList,
  startCareManagementChat,
  SendMessageRequest,
} from '../../services/healthChatbot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CareChatScreenProps {
  petId: number;
  conversationId?: number | null;
  onNavigateBack: () => void;
  onNavigateToInbox?: () => void;
}

const CareChatScreen = ({
  petId,
  conversationId,
  onNavigateBack,
  onNavigateToInbox,
}: CareChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 초기 AI 인사 메시지
  useEffect(() => {
    console.log('[CareChatScreen] 마운트됨', { petId, conversationId });
    
    const initializeChat = async () => {
      if (conversationId) {
        // 기존 대화 불러오기
        console.log('[CareChatScreen] 기존 대화 불러오기 시작', { conversationId });
        await loadConversation();
      } else {
        // 새 대화 시작
        console.log('[CareChatScreen] 새 대화 시작 - API 호출');
        try {
          const response = await startCareManagementChat(petId);
          console.log('[CareChatScreen] startCareManagementChat 응답:', response);
          
          if (response.success) {
            console.log('[CareChatScreen] 새 대화 시작 성공');
            const initialMessage: Message = {
              role: 'assistant',
              content:
                '안녕하세요! 반려동물의 케어 관리에 대해 궁금한 점이 있으시면 언제든 물어보세요. 식이, 예방, 수술 후 케어 등 다양한 정보를 제공해드릴 수 있습니다.',
              timestamp: new Date(),
            };
            setMessages([initialMessage]);
          } else {
            console.warn('[CareChatScreen] 새 대화 시작 실패:', response.message);
            Alert.alert('오류', response.message || '대화를 시작할 수 없습니다.');
          }
        } catch (error: any) {
          console.error('[CareChatScreen] 새 대화 시작 중 에러:', error);
          // 에러가 발생해도 초기 메시지는 표시
          const initialMessage: Message = {
            role: 'assistant',
            content:
              '안녕하세요! 반려동물의 케어 관리에 대해 궁금한 점이 있으시면 언제든 물어보세요. 식이, 예방, 수술 후 케어 등 다양한 정보를 제공해드릴 수 있습니다.',
            timestamp: new Date(),
          };
          setMessages([initialMessage]);
        }
      }
    };

    initializeChat();
  }, [conversationId, petId]);

  // 기존 대화 불러오기
  const loadConversation = async () => {
    if (!conversationId) {
      console.warn('[CareChatScreen] loadConversation: conversationId가 없음');
      return;
    }

    console.log('[CareChatScreen] loadConversation 시작', { petId, conversationId });

    try {
      setLoading(true);
      console.log('[CareChatScreen] getConversationScript API 호출');
      const response = await getConversationScript(
        petId,
        'care_management',
        null,
        conversationId
      );
      console.log('[CareChatScreen] getConversationScript 응답:', response);

      if (response.success && response.data?.messages) {
        console.log('[CareChatScreen] 대화 메시지 로드 성공', { messageCount: response.data.messages.length });
        const loadedMessages: Message[] = response.data.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(),
        }));
        setMessages(loadedMessages);
      } else {
        console.warn('[CareChatScreen] 대화 불러오기 실패:', response.message);
      }
    } catch (error: any) {
      console.error('[CareChatScreen] 대화 불러오기 실패:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || error.message || '대화를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 메시지 추가 시 스크롤
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // 히스토리 목록 불러오기
  const loadHistory = async () => {
    try {
      console.log('[CareChatScreen] 히스토리 로드 시작', { petId, conversationType: 'care_management' });
      setLoadingHistory(true);
      
      const response = await getConversationList(petId, 'care_management');
      console.log('[CareChatScreen] 히스토리 API 응답:', response);

      if (response.success && response.data?.conversations) {
        console.log('[CareChatScreen] ✅ 히스토리 로드 성공, 대화 개수:', response.data.conversations.length);
        setHistoryList(response.data.conversations);
      } else {
        console.warn('[CareChatScreen] ⚠️ 히스토리가 비어있거나 응답 형식이 올바르지 않음');
        setHistoryList([]);
      }
    } catch (error: any) {
      console.error('[CareChatScreen] ❌ 히스토리 불러오기 실패:', error);
      console.error('[CareChatScreen] 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      
      // 404 에러인 경우 조용히 처리 (히스토리는 선택적 기능)
      if (error.response?.status === 404) {
        console.warn('[CareChatScreen] 404 에러: 히스토리 API 엔드포인트가 없을 수 있습니다.');
      }
      setHistoryList([]);
    } finally {
      setLoadingHistory(false);
      console.log('[CareChatScreen] 히스토리 로드 완료');
    }
  };

  // 히스토리 탭 열기
  const handleOpenHistory = () => {
    setShowHistory(true);
    loadHistory();
  };

  // 히스토리 항목 선택
  const handleSelectHistory = (selectedConversationId: number) => {
    // 선택한 대화로 이동
    setShowHistory(false);
    // 상위 컴포넌트에 알림 (App.tsx에서 처리)
    // 여기서는 히스토리만 닫고, 실제 로드는 상위 컴포넌트에서 처리
    // TODO: 상위 컴포넌트에 conversationId 변경을 알리는 방법 필요
  };

  /**
   * 메시지 전송
   */
  const handleSendMessage = async () => {
    console.log('[CareChatScreen] handleSendMessage 호출됨', { inputText: inputText.trim(), loading });
    
    if (!inputText.trim()) {
      console.log('[CareChatScreen] 입력 텍스트가 비어있음');
      Alert.alert('알림', '질문을 입력해주세요.');
      return;
    }

    if (loading) {
      console.log('[CareChatScreen] 이미 로딩 중이므로 중단');
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');
    console.log('[CareChatScreen] 사용자 메시지:', userMessage);

    // 사용자 메시지 추가
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      setLoading(true);

      const request: SendMessageRequest = {
        petId: Number(petId),
        conversationType: 'care_management',
        message: userMessage,
      };

      console.log('[CareChatScreen] sendMessage API 호출', request);
      const response = await sendMessage(request);
      console.log('[CareChatScreen] sendMessage 응답:', response);

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
      Alert.alert('오류', errorMessage);
      // 실패한 사용자 메시지 제거
      setMessages((prev) => prev.filter((msg) => msg !== newUserMessage));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 대화 보관하기 모달 열기
   */
  const handleSaveToInboxConfirm = () => {
    console.log('[CareChatScreen] handleSaveToInboxConfirm 호출됨 - 대화 보관하기 모달 열기');
    if (messages.length <= 1) {
      console.warn('[CareChatScreen] 정리할 내용이 없음 (메시지 개수:', messages.length, ')');
      Alert.alert('알림', '정리할 내용이 없습니다.');
      return;
    }
    console.log('[CareChatScreen] 보관 모달 표시, 메시지 개수:', messages.length);
    setShowSaveModal(true);
  };

  /**
   * 대화 보관함으로 이동 (실제 저장)
   */
  const handleSaveToInbox = async () => {
    console.log('[CareChatScreen] handleSaveToInbox 호출됨 - 대화 보관하기 시작');
    setShowSaveModal(false);
    
    try {
      setEnding(true);
      console.log('[CareChatScreen] 대화 보관 API 호출 시작', {
        petId: Number(petId),
        conversationType: 'care_management',
        saveReport: true,
        messageCount: messages.length,
      });
      
      const response = await endConversation({
        petId: Number(petId),
        conversationType: 'care_management',
        saveReport: true,
      });

      console.log('[CareChatScreen] 대화 보관 API 응답:', response);

      if (response.success) {
        console.log('[CareChatScreen] ✅ 대화 보관 성공');
        console.log('[CareChatScreen] 응답 데이터:', response.data);
        Alert.alert('알림', '대화가 보관함에 저장되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              console.log('[CareChatScreen] 보관 성공 후 보관함으로 이동');
              if (onNavigateToInbox) {
                console.log('[CareChatScreen] onNavigateToInbox 호출');
                onNavigateToInbox();
              } else {
                console.log('[CareChatScreen] onNavigateBack 호출');
                onNavigateBack();
              }
            },
          },
        ]);
      } else {
        console.error('[CareChatScreen] ❌ 대화 보관 실패:', response.message);
        throw new Error(response.message || '보관함 저장에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('[CareChatScreen] ❌ 대화 보관 실패:', error);
      console.error('[CareChatScreen] 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      Alert.alert(
        '오류',
        error.response?.data?.message ||
          error.message ||
          '보관함 저장 실패'
      );
    } finally {
      setEnding(false);
      console.log('[CareChatScreen] 대화 보관 프로세스 완료');
    }
  };

  /**
   * 대화 종료 모달 열기
   */
  const handleEndConversation = () => {
    console.log('[CareChatScreen] handleEndConversation 호출됨 - 종료 모달 열기');
    setShowEndModal(true);
  };

  /**
   * 대화 종료 확인
   */
  const handleConfirmEnd = async () => {
    console.log('[CareChatScreen] handleConfirmEnd 호출됨');
    setShowEndModal(false);
    try {
      setEnding(true);
      console.log('[CareChatScreen] 대화 종료 API 호출 시작', { petId, conversationType: 'care_management' });
      
      const response = await endConversation({
        petId: Number(petId),
        conversationType: 'care_management',
        saveReport: false,
      });

      console.log('[CareChatScreen] 대화 종료 API 응답:', response);

      if (response.success) {
        console.log('[CareChatScreen] 대화 종료 성공, BotHome으로 이동');
        // Alert 없이 바로 BotHome으로 이동
        onNavigateBack();
      } else {
        console.warn('[CareChatScreen] 대화 종료 실패:', response.message);
        throw new Error(response.message || '대화 종료에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('[CareChatScreen] 대화 종료 실패:', error);
      console.error('[CareChatScreen] 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert(
        '오류',
        error.response?.data?.message ||
          error.message ||
          '대화 종료에 실패했습니다.'
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
        <Text style={styles.headerTitle}>케어 관리 상담</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleOpenHistory}
            style={styles.historyButton}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
          </TouchableOpacity>
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
      {messages.length > 1 && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.inboxButton}
            onPress={handleSaveToInboxConfirm}
            disabled={ending || loading}
          >
            {ending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="archive-outline" size={20} color="#fff" />
                <Text style={styles.inboxButtonText}>대화 보관하기</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="질문을 입력해주세요"
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!loading && !ending}
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

      {/* 히스토리 사이드바 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHistory}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.historyOverlay}>
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>대화 히스토리</Text>
              <TouchableOpacity
                onPress={() => setShowHistory(false)}
                style={styles.historyCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.historyList}>
              {loadingHistory ? (
                <View style={styles.historyLoading}>
                  <ActivityIndicator size="small" color="#FF8A3D" />
                </View>
              ) : historyList.length === 0 ? (
                <View style={styles.historyEmpty}>
                  <Text style={styles.historyEmptyText}>저장된 대화가 없습니다.</Text>
                </View>
              ) : (
                historyList.map((item) => (
                  <TouchableOpacity
                    key={item.conversationId}
                    style={styles.historyItem}
                    onPress={() => handleSelectHistory(item.conversationId)}
                  >
                    <Text style={styles.historyItemDate}>
                      {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                    </Text>
                    {item.summary && (
                      <Text style={styles.historyItemSummary} numberOfLines={2}>
                        {item.summary}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 대화 보관하기 확인 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSaveModal}
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="archive-outline" size={48} color="#FF8A3D" />
            </View>
            <Text style={styles.modalTitle}>대화를 보관하시겠습니까?</Text>
            <Text style={styles.modalMessage}>대화 내용이 보관함에 저장됩니다.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowSaveModal(false)}
                disabled={ending}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleSaveToInbox}
                disabled={ending}
              >
                {ending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>보관하기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyButton: {
    padding: 4,
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
  },
  inboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8A3D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  inboxButtonText: {
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
  historyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  historyContainer: {
    width: '75%',
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  historyCloseButton: {
    padding: 4,
  },
  historyList: {
    flex: 1,
  },
  historyLoading: {
    padding: 20,
    alignItems: 'center',
  },
  historyEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  historyEmptyText: {
    fontSize: 14,
    color: '#999',
  },
  historyItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  historyItemDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  historyItemSummary: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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

export default CareChatScreen;

