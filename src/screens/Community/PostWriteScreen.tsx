/**
 * PostWriteScreen
 * 게시글 작성 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BoardType, CreatePostRequest } from '../../types/community';
import * as communityService from '../../services/community';
import Button from '../../components/common/Button';

interface PostWriteScreenProps {
  onNavigateBack: () => void;
  onPostCreated: (postId: number) => void;
  boardType: BoardType;
  userLocation?: {
    latitude: number;
    longitude: number;
    locationName: string;
  };
}

const PostWriteScreen: React.FC<PostWriteScreenProps> = ({
  onNavigateBack,
  onPostCreated,
  boardType,
  userLocation,
}) => {
  const [selectedBoardType, setSelectedBoardType] = useState<BoardType>(boardType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isFreeBoard = selectedBoardType === 'free';

  // 이미지 추가 (임시로 플레이스홀더 사용)
  const handleAddImage = () => {
    if (images.length >= 5) {
      Alert.alert('알림', '이미지는 최대 5장까지 추가할 수 있습니다.');
      return;
    }

    Alert.alert(
      '이미지 추가',
      '실제 구현에서는 이미지 선택기를 사용합니다.\n현재는 플레이스홀더 이미지를 추가합니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: () => {
            setImages((prev) => [...prev, `https://via.placeholder.com/300x200?text=Image${prev.length + 1}`]);
          },
        },
      ]
    );
  };

  // 이미지 제거
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 게시글 등록
  const handleSubmit = async () => {
    // 유효성 검사
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (title.trim().length > 50) {
      Alert.alert('알림', '제목은 최대 50자까지 입력할 수 있습니다.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    if (!userLocation) {
      Alert.alert('알림', '위치 정보를 불러올 수 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const postData: CreatePostRequest = {
        boardType: selectedBoardType,
        title: title.trim(),
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        locationName: userLocation.locationName,
      };

      const response = await communityService.createPost(postData);

      if (response.success && response.data?.postId) {
        Alert.alert('성공', '게시글이 등록되었습니다.', [
          {
            text: '확인',
            onPress: () => onPostCreated(response.data!.postId),
          },
        ]);
      } else {
        Alert.alert('오류', response.message || '게시글 등록에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('게시글 등록 에러:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || '게시글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글 작성</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 게시판 선택 */}
        <View style={styles.section}>
          <Text style={styles.label}>
            게시판 <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.boardTypeContainer}>
            <TouchableOpacity
              style={[
                styles.boardTypeButton,
                selectedBoardType === 'free' && styles.boardTypeButtonActive,
              ]}
              onPress={() => setSelectedBoardType('free')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.boardTypeButtonText,
                  selectedBoardType === 'free' && styles.boardTypeButtonTextActive,
                ]}
              >
                자유게시판
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.boardTypeButton,
                selectedBoardType === 'qna' && styles.boardTypeButtonActive,
              ]}
              onPress={() => setSelectedBoardType('qna')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.boardTypeButtonText,
                  selectedBoardType === 'qna' && styles.boardTypeButtonTextActive,
                ]}
              >
                질문답변
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 제목 */}
        <View style={styles.section}>
          <Text style={styles.label}>
            제목 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor="#999"
            maxLength={50}
          />
          <Text style={styles.charCount}>{title.length}/50</Text>
        </View>

        {/* 내용 */}
        <View style={styles.section}>
          <Text style={styles.label}>
            본문 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="본문 내용을 입력하세요"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 사진 */}
        <View style={styles.section}>
          <Text style={styles.label}>사진</Text>
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleAddImage}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={32} color="#999" />
              <Text style={styles.addImageText}>이미지 추가</Text>
              <Text style={styles.imageCount}>{images.length}/5</Text>
            </TouchableOpacity>

            {images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 등록 버튼 */}
      <View style={styles.footer}>
        <Button
          title="완료하기"
          onPress={handleSubmit}
          loading={loading}
          disabled={!title.trim() || !content.trim() || loading}
        />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerPlaceholder: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF8A3D',
  },
  boardTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  boardTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  boardTypeButtonActive: {
    backgroundColor: '#FF8A3D',
    borderColor: '#FF8A3D',
  },
  boardTypeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  boardTypeButtonTextActive: {
    color: '#fff',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
    minHeight: 200,
  },
  imageSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  addImageText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  imageCount: {
    fontSize: 10,
    color: '#BBB',
    marginTop: 2,
  },
  imageItem: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});

export default PostWriteScreen;
