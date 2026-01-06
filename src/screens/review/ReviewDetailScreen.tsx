/**
 * ReviewDetailScreen
 * 리뷰 상세 화면 (수정/삭제 가능)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../types/review';
import reviewService from '../../services/review';
import { User } from '../../types/auth';
import { getFullMediaUrl } from '../../utils/mediaUrl';

interface ReviewDetailScreenProps {
  reviewId: number;
  onNavigateBack: () => void;
  onNavigateToEdit?: (reviewId: number) => void;
  onReviewDeleted?: () => void;
  userData?: User;
}

const ReviewDetailScreen: React.FC<ReviewDetailScreenProps> = ({
  reviewId,
  onNavigateBack,
  onNavigateToEdit,
  onReviewDeleted,
  userData,
}) => {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadReviewDetail();
  }, [reviewId]);

  const loadReviewDetail = async () => {
    try {
      setLoading(true);
      const reviewData = await reviewService.getReviewDetail(reviewId);
      setReview(reviewData);
    } catch (error: any) {
      console.error('리뷰 상세 조회 실패:', error);
      Alert.alert('오류', '리뷰를 불러오는 중 오류가 발생했습니다.', [
        { text: '확인', onPress: onNavigateBack },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '리뷰 삭제',
      '정말 이 리뷰를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await reviewService.deleteReview(reviewId);
              Alert.alert('성공', '리뷰가 삭제되었습니다.', [
                {
                  text: '확인',
                  onPress: () => {
                    if (onReviewDeleted) {
                      onReviewDeleted();
                    }
                    onNavigateBack();
                  },
                },
              ]);
            } catch (error: any) {
              console.error('리뷰 삭제 실패:', error);
              Alert.alert('오류', error.message || '리뷰 삭제 중 오류가 발생했습니다.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleLikeToggle = async () => {
    if (!userData) {
      Alert.alert('알림', '로그인 후 이용 가능한 기능입니다.');
      return;
    }

    if (!review) return;

    try {
      if (review.isLiked) {
        const result = await reviewService.removeLike(reviewId);
        setReview({ ...review, isLiked: false, likeCount: result.likeCount });
      } else {
        const result = await reviewService.addLike(reviewId);
        setReview({ ...review, isLiked: true, likeCount: result.likeCount });
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={24}
        color="#FFD700"
      />
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A3D" />
      </View>
    );
  }

  if (!review) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>리뷰 상세</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>리뷰를 찾을 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  const isOwner = userData && review.author.userId === userData.userId;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰 상세</Text>
        {isOwner && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onNavigateToEdit && onNavigateToEdit(reviewId)}
            >
              <Ionicons name="create-outline" size={20} color="#FF8A3D" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              )}
            </TouchableOpacity>
          </View>
        )}
        {!isOwner && <View style={styles.headerRight} />}
      </View>

      <ScrollView style={styles.content}>
        {/* 작성자 정보 */}
        <View style={styles.authorSection}>
          <View style={styles.authorInfo}>
            {review.author.profileImageURL ? (
              <Image
                source={{ uri: review.author.profileImageURL }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#999" />
              </View>
            )}
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{review.author.nickname}</Text>
              <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            {renderStars(review.rating)}
          </View>
        </View>

        {/* 리뷰 내용 */}
        <View style={styles.contentSection}>
          <Text style={styles.reviewContent}>{review.content}</Text>
        </View>

        {/* 키워드 */}
        {review.keywords.length > 0 && (
          <View style={styles.keywordsSection}>
            {review.keywords.map((keyword, index) => (
              <View key={index} style={styles.keyword}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 미디어 */}
        {review.media.length > 0 && (
          <View style={styles.mediaSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {review.media.map((media) => {
                const fullUrl = getFullMediaUrl(media.mediaUrl);
                console.log(`[ReviewDetailScreen] 미디어 렌더링 - mediaId: ${media.mediaId}, type: ${media.mediaType}`);
                console.log(`[ReviewDetailScreen] 원본 URL: ${media.mediaUrl}`);
                console.log(`[ReviewDetailScreen] 변환된 URL: ${fullUrl}`);
                
                return (
                  <View key={media.mediaId} style={styles.mediaItem}>
                    {media.mediaType === 'image' ? (
                      <Image
                        source={{ uri: fullUrl }}
                        style={styles.mediaImage}
                        resizeMode="cover"
                        onLoad={() => {
                          console.log(`[ReviewDetailScreen] 이미지 로드 성공: ${fullUrl}`);
                        }}
                        onError={(error) => {
                          console.error(`[ReviewDetailScreen] 이미지 로드 실패: ${fullUrl}`, error);
                        }}
                      />
                    ) : (
                      <View style={styles.mediaVideo}>
                        <Ionicons name="play-circle" size={48} color="#fff" />
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 좋아요 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLikeToggle}
            disabled={!userData}
          >
            <Ionicons
              name={review.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={review.isLiked ? '#FF6B6B' : '#666'}
            />
            <Text
              style={[
                styles.likeCount,
                review.isLiked && styles.likedCount,
              ]}
            >
              {review.likeCount}
            </Text>
          </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  authorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  contentSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  keywordsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  keyword: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  keywordText: {
    fontSize: 14,
    color: '#666',
  },
  mediaSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mediaItem: {
    marginLeft: 20,
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  mediaVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFF5EF',
    borderRadius: 24,
  },
  likeCount: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  likedCount: {
    color: '#FF6B6B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ReviewDetailScreen;

