/**
 * PostCard Component
 * 커뮤니티 게시글 카드 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostListItem } from '../../types/community';

interface PostCardProps {
  post: PostListItem;
  onPress: () => void;
  onLikePress?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPress, onLikePress }) => {
  // 시간 포맷팅 함수
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // 초 단위

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

    // 7일 이상이면 날짜 표시
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 백엔드 응답 구조에 맞게 데이터 변환
  const authorNickname = (post as any).author?.nickname || post.authorNickname || '익명';
  const authorProfileUrl = (post as any).author?.profileImage || post.authorProfileUrl || null;
  const postTitle = post.title || '';
  const postContent = post.content || '';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* 작성자 정보 */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.profileImage}>
            {authorProfileUrl ? (
              <Image
                source={{ uri: authorProfileUrl }}
                style={styles.profileImageInner}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={40} color="#CCC" />
            )}
          </View>
          <View style={styles.authorTextContainer}>
            <Text style={styles.authorName}>{authorNickname}</Text>
            <Text style={styles.timestamp}>{formatTime(post.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={12} color="#FF8A3D" />
          <Text style={styles.locationText}>{post.locationName || ''}</Text>
        </View>
      </View>

      {/* 게시글 제목 */}
      {postTitle ? (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={2}>
            {postTitle}
          </Text>
        </View>
      ) : null}

      {/* 게시글 내용 */}
      <View style={styles.content}>
        <Text style={styles.contentText} numberOfLines={3}>
          {postContent}
        </Text>
      </View>

      {/* 이미지들 */}
      {post.images && post.images.length > 0 && (
        <View style={styles.imageContainer}>
          {post.images.slice(0, 3).map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* 좋아요, 댓글 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLikePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.isLikedByMe ? 'heart' : 'heart-outline'}
            size={20}
            color={post.isLikedByMe ? '#FF8A3D' : '#666'}
          />
          <Text style={[styles.actionText, post.isLikedByMe && styles.actionTextActive]}>
            {post.likeCount}
          </Text>
        </TouchableOpacity>
        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{post.commentCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInner: {
    width: 40,
    height: 40,
  },
  authorTextContainer: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 11,
    color: '#FF8A3D',
    marginLeft: 2,
    fontWeight: '600',
  },
  titleContainer: {
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  content: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  image: {
    width: (Dimensions.get('window').width - 32 - 16) / 3,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  actionTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
});

export default PostCard;

