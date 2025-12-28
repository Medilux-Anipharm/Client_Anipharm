/**
 * PostDetailScreen
 * 게시글 상세 화면
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostDetail } from '../../types/community';
import * as communityService from '../../services/community';
import CommentItem from '../../components/community/CommentItem';
import CommentInput from '../../components/community/CommentInput';
import { User } from '../../types/auth';

interface PostDetailScreenProps {
  postId: number;
  onNavigateBack: () => void;
  userData?: User;
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
  postId,
  onNavigateBack,
  userData,
}) => {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 게시글 상세 정보 불러오기
  const loadPostDetail = async () => {
    setLoading(true);
    try {
      const response = await communityService.getPostDetail(postId);

      if (response.success) {
        setPost(response.data);
        setIsLiked(response.data.isLiked || false);
        setLikeCount(response.data.likeCount);
      } else {
        Alert.alert('오류', response.message || '게시글을 불러올 수 없습니다.', [
          { text: '확인', onPress: onNavigateBack },
        ]);
      }
    } catch (error: any) {
      console.error('게시글 상세 조회 에러:', error);
      if (error.response?.status === 404) {
        Alert.alert('알림', '삭제된 게시글입니다.', [
          { text: '확인', onPress: onNavigateBack },
        ]);
      } else {
        Alert.alert('오류', '게시글을 불러오는 중 오류가 발생했습니다.', [
          { text: '확인', onPress: onNavigateBack },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostDetail();
  }, [postId]);

  // 좋아요 토글
  const handleLikeToggle = async () => {
    if (!userData) {
      Alert.alert('알림', '로그인 후 이용 가능한 기능입니다.');
      return;
    }

    try {
      if (isLiked) {
        await communityService.removeLike(postId);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await communityService.addLike(postId);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error('좋아요 토글 에러:', error);
      Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (content: string) => {
    if (!userData) {
      Alert.alert('알림', '로그인 후 이용 가능한 기능입니다.');
      return;
    }

    try {
      const response = await communityService.createComment(postId, { content });

      if (response.success) {
        // 게시글 다시 불러오기 (댓글 목록 업데이트)
        loadPostDetail();
      } else {
        Alert.alert('오류', response.message || '댓글 등록에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('댓글 작성 에러:', error);
      Alert.alert('오류', '댓글 작성 중 오류가 발생했습니다.');
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId: number) => {
    Alert.alert('댓글 삭제', '댓글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await communityService.deleteComment(commentId);

            if (response.success) {
              loadPostDetail();
            } else {
              Alert.alert('오류', response.message || '댓글 삭제에 실패했습니다.');
            }
          } catch (error: any) {
            console.error('댓글 삭제 에러:', error);
            Alert.alert('오류', '댓글 삭제 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8A3D" />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton} onPress={handleLikeToggle}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={isLiked ? '#FF8A3D' : '#333'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 작성자 정보 */}
          <View style={styles.authorSection}>
            <View style={styles.authorInfo}>
              <View style={styles.profileImage}>
                {post.authorProfileUrl ? (
                  <Image
                    source={{ uri: post.authorProfileUrl }}
                    style={styles.profileImageInner}
                  />
                ) : (
                  <Ionicons name="person-circle-outline" size={40} color="#CCC" />
                )}
              </View>
              <View style={styles.authorTextContainer}>
                <Text style={styles.authorName}>{post.authorNickname}</Text>
                <Text style={styles.timestamp}>{formatTime(post.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={12} color="#FF8A3D" />
              <Text style={styles.locationText}>{post.locationName}</Text>
            </View>
          </View>

          {/* 게시글 내용 */}
          <View style={styles.postContent}>
            <Text style={styles.contentText}>{post.content}</Text>
          </View>

          {/* 이미지들 */}
          {post.images && post.images.length > 0 && (
            <View style={styles.imagesContainer}>
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          {/* 좋아요, 댓글 수 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={18} color="#FF8A3D" />
              <Text style={styles.statText}>{likeCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={18} color="#666" />
              <Text style={styles.statText}>{post.commentCount}</Text>
            </View>
          </View>

          {/* 댓글 목록 */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsSectionTitle}>
              댓글 {post.comments.length}
            </Text>
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <CommentItem
                  key={comment.commentId}
                  comment={comment}
                  currentUserId={userData?.userId}
                  onDeletePress={() => handleCommentDelete(comment.commentId)}
                />
              ))
            ) : (
              <View style={styles.noCommentsContainer}>
                <Text style={styles.noCommentsText}>아직 댓글이 없습니다</Text>
                <Text style={styles.noCommentsSubText}>첫 번째 댓글을 작성해보세요!</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* 댓글 입력 */}
        <CommentInput
          onSubmit={handleCommentSubmit}
          disabled={!userData}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  likeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  authorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  imagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  commentsSection: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  commentsSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  noCommentsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  noCommentsSubText: {
    fontSize: 12,
    color: '#BBB',
  },
});

export default PostDetailScreen;
