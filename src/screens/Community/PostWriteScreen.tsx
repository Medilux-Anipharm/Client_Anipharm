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
// expo-image-picker 설치 필요: npx expo install expo-image-picker
import * as ImagePicker from 'expo-image-picker';
import { BoardType, CreatePostRequest } from '../../types/community';
import * as communityService from '../../services/community';
import Button from '../../components/common/Button';
import { API_CONFIG } from '../../config/api';

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
  const [imageUris, setImageUris] = useState<string[]>([]); // 로컬 이미지 URI
  const [loading, setLoading] = useState(false);

  const isFreeBoard = selectedBoardType === 'free';

  // 이미지 선택
  const handleAddImage = async () => {
    if (imageUris.length >= 5) {
      Alert.alert('알림', '이미지는 최대 5장까지 추가할 수 있습니다.');
      return;
    }

    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('알림', '이미지 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newImageUri = asset.uri;
        
        // 로컬 URI 저장 (미리보기용, 게시글 작성 시 함께 업로드)
        setImageUris((prev) => [...prev, newImageUri]);
      }
    } catch (error: any) {
      console.error('이미지 선택 에러:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  // 이미지 제거
  const handleRemoveImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
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
      let response;
      
      // 이미지가 있으면 FormData로, 없으면 JSON으로 전송
      if (imageUris.length > 0) {
        // FormData로 이미지와 게시글 데이터 함께 전송
        const formData = new FormData();
        
        // 게시글 데이터 추가
        formData.append('boardType', selectedBoardType);
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('latitude', userLocation.latitude.toString());
        formData.append('longitude', userLocation.longitude.toString());
        formData.append('locationName', userLocation.locationName);

        // 이미지 추가 (웹/앱 구분)
        for (let index = 0; index < imageUris.length; index++) {
          const imageUri = imageUris[index];
          let filename = imageUri.split('/').pop() || `image_${index}.jpg`;
          
          // 파일명에 확장자가 없으면 MIME 타입 기반으로 추가
          if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
            // MIME 타입 확인을 위해 이미지 로드 시도
            try {
              const response = await fetch(imageUri);
              const blob = await response.blob();
              const mimeType = blob.type || 'image/jpeg';
              const ext = mimeType.split('/')[1] || 'jpg';
              filename = `image_${index}.${ext}`;
            } catch (e) {
              filename = `image_${index}.jpg`;
            }
          }
          
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          if (Platform.OS === 'web') {
            // 웹 환경: File 객체로 변환
            try {
              const response = await fetch(imageUri);
              const blob = await response.blob();
              const file = new File([blob], filename, { type: blob.type || type });
              formData.append('images', file);
              console.log(`[웹] 이미지 ${index + 1} 추가됨: ${filename} (${blob.type})`);
            } catch (error) {
              console.error('[웹] 이미지 변환 실패:', error);
              throw new Error('이미지 변환에 실패했습니다.');
            }
          } else {
            // React Native 환경: uri, name, type 형식 사용
            formData.append('images', {
              uri: imageUri,
              name: filename,
              type: type,
            } as any);
            console.log(`[앱] 이미지 ${index + 1} 추가됨: ${filename}`);
          }
        }

        response = await communityService.createPostWithImages(formData);
      } else {
        // 이미지가 없으면 일반 JSON으로 전송
        const postData: CreatePostRequest = {
          boardType: selectedBoardType,
          title: title.trim(),
          content: content.trim(),
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          locationName: userLocation.locationName,
        };
        
        response = await communityService.createPost(postData);
      }

      console.log('게시글 작성 응답:', response);
      
      if (response.success && response.data?.postId) {
        // 폼 초기화
        setTitle('');
        setContent('');
        setImageUris([]);
        
        // 바로 상세페이지로 이동 (Alert 없이)
        onPostCreated(response.data.postId);
      } else {
        console.error('게시글 작성 실패:', response);
        Alert.alert('오류', response.message || '게시글 등록에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('게시글 등록 에러:', error);
      console.error('에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert(
        '오류',
        error.response?.data?.message || error.message || '게시글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
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
              <Text style={styles.imageCount}>{imageUris.length}/5</Text>
            </TouchableOpacity>

            {imageUris.map((imageUri, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
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
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});

export default PostWriteScreen;
