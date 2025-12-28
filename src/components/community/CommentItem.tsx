/**
 * CommentItem Component
 * 커뮤니티 댓글 아이템 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../../types/community';

interface CommentItemProps {
  comment: Comment;
  onDeletePress?: () => void;
  currentUserId?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDeletePress,
  currentUserId,
}) => {
  // 시간 포맷팅 함수
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  const isMyComment = currentUserId === comment.userId;

  return (
    <View style={styles.container}>
      {/* 프로필 이미지 */}
      <View style={styles.profileImage}>
        {comment.userProfileUrl ? (
          <Image
            source={{ uri: comment.userProfileUrl }}
            style={styles.profileImageInner}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={32} color="#CCC" />
        )}
      </View>

      {/* 댓글 내용 */}
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.nickname}>{comment.userNickname}</Text>
          <Text style={styles.timestamp}>{formatTime(comment.createdAt)}</Text>
        </View>
        <Text style={styles.content}>{comment.content}</Text>
      </View>

      {/* 삭제 버튼 (본인 댓글만) */}
      {isMyComment && onDeletePress && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDeletePress}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInner: {
    width: 32,
    height: 32,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  content: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  deleteButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentItem;
