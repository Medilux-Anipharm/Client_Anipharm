/**
 * ReviewWriteScreen
 * 리뷰 작성 화면
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import reviewService from '../../services/review';
import { CreateReviewData, Review } from '../../types/review';

interface ReviewWriteScreenProps {
  type: 'pharmacy' | 'hospital';
  placeId: number;
  placeName: string;
  reviewId?: number; // 수정 모드일 때
  onNavigateBack: () => void;
  onReviewCreated?: (reviewId?: number) => void;
}

const ReviewWriteScreen: React.FC<ReviewWriteScreenProps> = ({
  type,
  placeId,
  placeName,
  reviewId,
  onNavigateBack,
  onReviewCreated,
}) => {

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // 수정 모드일 때 기존 리뷰 데이터 로드
  useEffect(() => {
    if (reviewId) {
      loadReviewData();
    }
  }, [reviewId]);

  const loadReviewData = async () => {
    try {
      setLoading(true);
      const reviewData = await reviewService.getReviewDetail(reviewId!);
      setRating(reviewData.rating);
      setContent(reviewData.content);
      // keywords가 문자열 배열이거나 객체 배열일 수 있음
      setKeywords(
        reviewData.keywords.map((k: any) => 
          typeof k === 'string' ? k : (k.keyword || k)
        )
      );
      setSelectedImages(
        reviewData.media
          .filter((m) => m.mediaType === 'image')
          .map((m) => m.mediaUrl)
      );
    } catch (error: any) {
      console.error('리뷰 데이터 로드 실패:', error);
      Alert.alert('오류', '리뷰 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const availableKeywords = [
    '친절해요',
    '깨끗해요',
    '가격이 합리적이에요',
    '위치가 좋아요',
    '재고가 많아요',
    '응급처치가 빨라요',
    '설명이 자세해요',
  ];

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 선택하려면 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images) || 
                  (ImagePicker.MediaType && ImagePicker.MediaType.Images) ||
                  'images',
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - selectedImages.length,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleKeyword = (keyword: string) => {
    setKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('별점 필수', '별점을 선택해주세요.');
      return;
    }

    if (content.trim().length === 0) {
      Alert.alert('내용 필수', '리뷰 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      // 이미지를 FormData로 변환 (커뮤니티 방식 참고)
      const mediaFiles = selectedImages.map((uri, index) => {
        let filename = uri.split('/').pop() || `image_${index}.jpg`;
        
        // 파일명에 확장자가 없으면 MIME 타입 기반으로 추가
        if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
          filename = `image_${index}.jpg`;
        }
        
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        if (Platform.OS === 'web') {
          // 웹 환경: File 객체로 변환
          return {
            uri,
            name: filename,
            type,
            isWeb: true,
          } as any;
        } else {
          // React Native 환경: uri, name, type 형식 사용
          return {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            name: filename,
            type,
          } as any;
        }
      });

      const reviewData: CreateReviewData = {
        rating,
        content: content.trim(),
        keywords,
        mediaFiles,
      };

      let resultReview: Review;
      if (reviewId) {
        // 수정 모드
        resultReview = await reviewService.updateReview(reviewId, reviewData);
        Alert.alert('성공', '리뷰가 수정되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              if (onReviewCreated) {
                onReviewCreated(reviewId);
              }
              onNavigateBack();
            },
          },
        ]);
      } else {
        // 작성 모드
        if (type === 'pharmacy') {
          resultReview = await reviewService.createPharmacyReview(placeId, reviewData);
        } else {
          resultReview = await reviewService.createHospitalReview(placeId, reviewData);
        }
        Alert.alert('성공', '리뷰가 작성되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              // 리뷰 생성 완료 콜백 호출
              if (onReviewCreated) {
                onReviewCreated(resultReview.reviewId);
              }
              // 상세 화면으로 돌아가기
              onNavigateBack();
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('리뷰 작성 실패:', error);
      Alert.alert('오류', error.message || '리뷰 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setRating(index + 1)}
        style={styles.starButton}
      >
        <Ionicons
          name={index < rating ? 'star' : 'star-outline'}
          size={40}
          color={index < rating ? '#FFD700' : '#DDD'}
        />
      </TouchableOpacity>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A3D" />
        <Text style={styles.loadingText}>리뷰 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onNavigateBack}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {reviewId ? '리뷰 수정' : '리뷰 작성'}
        </Text>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>완료</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 장소 정보 */}
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{placeName}</Text>
          <Text style={styles.placeType}>
            {type === 'pharmacy' ? '동물약국' : '동물병원'}
          </Text>
        </View>

        {/* 별점 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>별점을 선택해주세요</Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
        </View>

        {/* 리뷰 내용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>리뷰를 작성해주세요</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="이곳에 대한 리뷰를 작성해주세요..."
            multiline
            numberOfLines={8}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/500</Text>
        </View>

        {/* 키워드 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>키워드를 선택해주세요 (선택사항)</Text>
          <View style={styles.keywordsContainer}>
            {availableKeywords.map((keyword) => (
              <TouchableOpacity
                key={keyword}
                style={[
                  styles.keyword,
                  keywords.includes(keyword) && styles.keywordSelected,
                ]}
                onPress={() => toggleKeyword(keyword)}
              >
                <Text
                  style={[
                    styles.keywordText,
                    keywords.includes(keyword) && styles.keywordTextSelected,
                  ]}
                >
                  {keyword}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 사진 추가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>사진을 추가해주세요 (선택사항)</Text>
          <Text style={styles.sectionSubtitle}>최대 5장까지 추가할 수 있습니다</Text>
          <View style={styles.imagesContainer}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedImages.length < 5 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleImagePicker}
              >
                <Ionicons name="camera-outline" size={32} color="#999" />
                <Text style={styles.addImageText}>사진 추가</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  submitButton: {
    backgroundColor: '#FF8A3D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  placeInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placeType: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 120,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keyword: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  keywordSelected: {
    backgroundColor: '#FFF5EF',
    borderColor: '#FF8A3D',
  },
  keywordText: {
    fontSize: 14,
    color: '#666',
  },
  keywordTextSelected: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ReviewWriteScreen;

