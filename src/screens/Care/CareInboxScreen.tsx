/**
 * CareInboxScreen
 * 케어 관리 모드 대화 보관함 화면
 */

import React, { useState, useEffect, Fragment } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getInboxList, deleteConversation, InboxItem } from '../../services/healthChatbot';

interface CareInboxScreenProps {
  petId: number;
  onNavigateBack: () => void;
  onNavigateToDetail?: (conversationId: number) => void;
}

const CareInboxScreen = ({
  petId,
  onNavigateBack,
  onNavigateToDetail,
}: CareInboxScreenProps) => {
  const [inboxList, setInboxList] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadInboxList();
  }, [petId]);

  const loadInboxList = async () => {
    try {
      console.log('[CareInboxScreen] 보관함 목록 로드 시작', { petId, conversationType: 'care_management' });
      setLoading(true);
      
      const response = await getInboxList(petId, 'care_management');
      console.log('[CareInboxScreen] 보관함 목록 API 응답:', response);

      if (response.success && response.data?.conversations) {
        console.log('[CareInboxScreen] ✅ 보관함 목록 로드 성공, 대화 개수:', response.data.conversations.length);
        console.log('[CareInboxScreen] 대화 목록:', response.data.conversations);
        setInboxList(response.data.conversations);
      } else {
        console.warn('[CareInboxScreen] ⚠️ 보관함 목록이 비어있거나 응답 형식이 올바르지 않음');
        setInboxList([]);
      }
    } catch (error: any) {
      console.error('[CareInboxScreen] ❌ 보관함 불러오기 실패:', error);
      console.error('[CareInboxScreen] 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      
      // 404 에러인 경우 특별 처리
      if (error.response?.status === 404) {
        console.warn('[CareInboxScreen] 404 에러: API 엔드포인트가 없을 수 있습니다.');
        Alert.alert(
          '알림',
          '보관함 기능이 아직 준비되지 않았습니다. 곧 제공될 예정입니다.'
        );
      } else {
        Alert.alert(
          '오류',
          error.response?.data?.message || error.message || '보관함을 불러오는데 실패했습니다.'
        );
      }
      setInboxList([]);
    } finally {
      setLoading(false);
      console.log('[CareInboxScreen] 보관함 목록 로드 완료');
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '날짜 정보 없음';
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) return '날짜 정보 없음';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '오늘';
    } else if (days === 1) {
      return '어제';
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  // 삭제 모드 토글
  const handleToggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedItems(new Set());
  };

  // 체크박스 토글
  const handleToggleSelect = (conversationId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedItems(newSelected);
  };

  // 삭제 확인 모달 열기
  const handleDeletePress = () => {
    if (selectedItems.size === 0) {
      Alert.alert('알림', '삭제할 대화를 선택해주세요.');
      return;
    }
    setShowDeleteModal(true);
  };

  // 대화 삭제
  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    
    try {
      setDeleting(true);
      const deletePromises = Array.from(selectedItems).map((conversationId) =>
        deleteConversation(conversationId)
      );
      
      await Promise.all(deletePromises);
      
      // 삭제 성공 후 목록 새로고침
      await loadInboxList();
      setIsDeleteMode(false);
      setSelectedItems(new Set());
      
      Alert.alert('완료', '선택한 대화가 삭제되었습니다.');
    } catch (error: any) {
      console.error('대화 삭제 실패:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || error.message || '대화 삭제에 실패했습니다.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>대화 보관함</Text>
        <TouchableOpacity
          onPress={handleToggleDeleteMode}
          style={styles.deleteModeButton}
        >
          {isDeleteMode ? (
            <Text style={styles.deleteModeButtonText}>취소</Text>
          ) : (
            <Image 
              source={require('../../../ref/archivePage/Trash.png')} 
              style={styles.trashIcon}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </View>

      {/* 컨텐츠 */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF8A3D" />
          </View>
        ) : inboxList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>아직 나눈 대화가 없어요!</Text>
          </View>
        ) : (
          <Fragment>
            {inboxList.map((item) => (
              <View
                key={item.conversationId || `conversation-${item.startTime || Date.now()}`}
                style={[
                  styles.card,
                  isDeleteMode && selectedItems.has(item.conversationId) && styles.cardSelected,
                ]}
              >
                {isDeleteMode && (
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleToggleSelect(item.conversationId)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedItems.has(item.conversationId) && styles.checkboxChecked,
                      ]}
                    >
                      {selectedItems.has(item.conversationId) && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.cardContent}
                  onPress={() => {
                    if (!isDeleteMode && onNavigateToDetail) {
                      onNavigateToDetail(item.conversationId);
                    }
                  }}
                  activeOpacity={0.7}
                  disabled={isDeleteMode}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FF8A3D" />
                    </View>
                    <Text style={styles.cardDate}>
                      {formatDate(item.startTime || item.endTime || item.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.cardSummary} numberOfLines={3}>
                    {typeof item.summary === 'string' 
                      ? item.summary 
                      : item.summary?.firstUserMessage || item.summary?.lastAssistantMessage || '요약 정보가 없습니다.'}
                  </Text>
                  {!isDeleteMode && (
                    <View style={styles.cardFooter}>
                      <Ionicons name="chevron-forward" size={16} color="#999" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))}
            {isDeleteMode && (
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  selectedItems.size === 0 && styles.deleteButtonDisabled,
                ]}
                onPress={handleDeletePress}
                disabled={selectedItems.size === 0 || deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>삭제하기</Text>
                )}
              </TouchableOpacity>
            )}
          </Fragment>
        )}
      </ScrollView>

      {/* 삭제 확인 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF8A3D" />
            </View>
            <Text style={styles.modalTitle}>대화를 삭제하시겠습니까?</Text>
            <Text style={styles.modalMessage}>
              선택한 {selectedItems.size}개의 대화가 삭제됩니다.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>삭제</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  deleteModeButton: {
    padding: 4,
    minWidth: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  deleteModeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  trashIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: '#FF8A3D',
    borderWidth: 2,
    backgroundColor: '#FFF9F5',
  },
  checkboxContainer: {
    padding: 16,
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#FF8A3D',
    borderColor: '#FF8A3D',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardDate: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  cardSummary: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 4,
    fontWeight: '400',
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#FF8A3D',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 32,
    minHeight: 52,
    shadowColor: '#FF8A3D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonDisabled: {
    backgroundColor: '#FFD4B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
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

export default CareInboxScreen;

