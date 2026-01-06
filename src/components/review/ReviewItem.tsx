/**
 * ReviewItem Component
 * 개별 리뷰 아이템 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../types/review';
import { getFullMediaUrl } from '../../utils/mediaUrl';

interface ReviewItemProps {
  review: Review;
  onPress?: () => void;
  onLikePress?: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onPress,
  onLikePress,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {review.author.profileImageURL ? (
              <Image
                source={{ uri: review.author.profileImageURL }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color="#999" />
              </View>
            )}
            {review.media.length > 0 && (
              <View style={styles.mediaBadge}>
                <Text style={styles.mediaBadgeText}>+{review.media.length}</Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.nickname}>{review.author.nickname}</Text>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(review.rating)}
        </View>
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {review.content}
      </Text>

      {/* 미디어 미리보기 */}
      {review.media && review.media.length > 0 && (
        <View style={styles.mediaContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {review.media.slice(0, 3).map((media) => {
              const fullUrl = getFullMediaUrl(media.mediaUrl);
              console.log(`[ReviewItem] 미디어 렌더링 - mediaId: ${media.mediaId}, type: ${media.mediaType}`);
              console.log(`[ReviewItem] 원본 URL: ${media.mediaUrl}`);
              console.log(`[ReviewItem] 변환된 URL: ${fullUrl}`);
              
              return (
                <View key={media.mediaId} style={styles.mediaItem}>
                  {media.mediaType === 'image' ? (
                    <Image
                      source={{ uri: fullUrl }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                      onLoad={() => {
                        console.log(`[ReviewItem] 이미지 로드 성공: ${fullUrl}`);
                      }}
                      onError={(error) => {
                        console.error(`[ReviewItem] 이미지 로드 실패: ${fullUrl}`, error);
                      }}
                    />
                  ) : (
                    <View style={styles.mediaVideo}>
                      <Ionicons name="play-circle" size={24} color="#fff" />
                    </View>
                  )}
                </View>
              );
            })}
            {review.media.length > 3 && (
              <View style={styles.moreMediaIndicator}>
                <Text style={styles.moreMediaText}>+{review.media.length - 3}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {review.keywords.length > 0 && (
        <View style={styles.keywordsContainer}>
          {review.keywords.map((keyword, index) => (
            <View key={index} style={styles.keyword}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={onLikePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={review.isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={review.isLiked ? '#FF6B6B' : '#666'}
          />
          <Text style={[styles.likeCount, review.isLiked && styles.likedCount]}>
            {review.likeCount}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FF8A3D',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  nickname: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  content: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 12,
  },
  mediaItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMediaIndicator: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMediaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  keyword: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
  },
  likedCount: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

export default ReviewItem;

