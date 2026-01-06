/**
 * CommunityScreen
 * 커뮤니티 메인 화면 (탭 선택: 전체, 자유게시판, 질문답변)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../../components/community/PostCard';
import { PostListItem, BoardType } from '../../types/community';
import * as communityService from '../../services/community';
import { User } from '../../types/auth';

interface CommunityScreenProps {
  onNavigateToPostDetail: (postId: number) => void;
  onNavigateToPostWrite: (boardType: BoardType) => void;
  userData?: User;
  userLocation?: {
    latitude: number;
    longitude: number;
    locationName?: string;
  };
}

type TabType = 'all' | 'free' | 'qna';

const CommunityScreen: React.FC<CommunityScreenProps> = ({
  onNavigateToPostDetail,
  onNavigateToPostWrite,
  userData,
  userLocation,
}) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 게시글 목록 불러오기
  const loadPosts = async (pageNum: number = 1, refresh: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      let allPosts: PostListItem[] = [];

      if (selectedTab === 'all') {
        // 전체 게시판 - 자유게시판과 질문답변 모두 가져오기
        const [freeResponse, qnaResponse] = await Promise.all([
          userLocation
            ? communityService.getPostListByLocation('free', {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius: 5,
                page: pageNum,
                limit: 20,
                sortBy: 'latest',
              })
            : communityService.getPostList('free', {
                page: pageNum,
                limit: 20,
                sortBy: 'latest',
              }),
          userLocation
            ? communityService.getPostListByLocation('qna', {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius: 5,
                page: pageNum,
                limit: 20,
                sortBy: 'latest',
              })
            : communityService.getPostList('qna', {
                page: pageNum,
                limit: 20,
                sortBy: 'latest',
              }),
        ]);

        // 두 게시판의 게시물을 합치고 최신순으로 정렬
        const freePosts = freeResponse.success
          ? freeResponse.data.posts.map((post: any) => ({
              ...post,
              authorNickname: post.author?.nickname || post.authorNickname || '익명',
              authorProfileUrl: post.author?.profileImage || post.authorProfileUrl || null,
              authorId: post.author?.userId || post.authorId || 0,
              images: post.thumbnail ? [post.thumbnail] : (post.images || []),
              title: post.title || '',
              content: post.content || '',
            }))
          : [];

        const qnaPosts = qnaResponse.success
          ? qnaResponse.data.posts.map((post: any) => ({
              ...post,
              authorNickname: post.author?.nickname || post.authorNickname || '익명',
              authorProfileUrl: post.author?.profileImage || post.authorProfileUrl || null,
              authorId: post.author?.userId || post.authorId || 0,
              images: post.thumbnail ? [post.thumbnail] : (post.images || []),
              title: post.title || '',
              content: post.content || '',
            }))
          : [];

        allPosts = [...freePosts, ...qnaPosts].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // 최신순 정렬
        });

        // 페이지네이션: 두 게시판 모두 더 이상 데이터가 없으면 hasMore = false
        const hasMoreFree = freeResponse.success ? freeResponse.data.pagination.hasNextPage : false;
        const hasMoreQna = qnaResponse.success ? qnaResponse.data.pagination.hasNextPage : false;
        setHasMore(hasMoreFree || hasMoreQna);
      } else {
        // 자유게시판 또는 Q&A
        const boardType: BoardType = selectedTab === 'free' ? 'free' : 'qna';
        const response = await communityService.getPostList(boardType, {
          page: pageNum,
          limit: 20,
          sortBy: 'latest',
        });

        if (response.success) {
          allPosts = response.data.posts.map((post: any) => ({
            ...post,
            authorNickname: post.author?.nickname || post.authorNickname || '익명',
            authorProfileUrl: post.author?.profileImage || post.authorProfileUrl || null,
            authorId: post.author?.userId || post.authorId || 0,
            images: post.thumbnail ? [post.thumbnail] : (post.images || []),
            title: post.title || '',
            content: post.content || '',
          }));
          setHasMore(response.data.pagination.hasNextPage);
        } else {
          Alert.alert('오류', response.message || '게시글 목록을 불러올 수 없습니다.');
          return;
        }
      }

      if (refresh || pageNum === 1) {
        setPosts(allPosts);
      } else {
        setPosts((prev) => [...prev, ...allPosts]);
      }
    } catch (error: any) {
      console.error('게시글 목록 조회 에러:', error);
      Alert.alert('오류', error.message || '게시글 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 탭 변경 시 게시글 목록 새로고침
  useEffect(() => {
    setPage(1);
    setPosts([]);
    loadPosts(1, true);
  }, [selectedTab]);

  // 새로고침
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadPosts(1, true);
  };

  // 더 불러오기
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, false);
    }
  };

  // 좋아요 토글
  const handleLikeToggle = async (postId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        await communityService.removeLike(postId);
      } else {
        await communityService.addLike(postId);
      }

      // 로컬 상태 업데이트
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === postId
            ? {
                ...post,
                isLikedByMe: !isLiked,
                likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );
    } catch (error: any) {
      console.error('좋아요 토글 에러:', error);
      if (error.response?.status === 401) {
        Alert.alert('알림', '로그인 후 이용 가능한 기능입니다.');
      } else {
        Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 게시글 작성 버튼 클릭
  const handleWritePost = () => {
    if (!userData) {
      Alert.alert('알림', '로그인 후 이용 가능한 기능입니다.');
      return;
    }

    const boardType: BoardType = selectedTab === 'qna' ? 'qna' : 'free';
    onNavigateToPostWrite(boardType);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'free' && styles.tabActive]}
          onPress={() => setSelectedTab('free')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedTab === 'free' && styles.tabTextActive]}>
            자유게시판
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'qna' && styles.tabActive]}
          onPress={() => setSelectedTab('qna')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedTab === 'qna' && styles.tabTextActive]}>
            질문답변
          </Text>
        </TouchableOpacity>
      </View>

      {/* 게시글 목록 */}
      <FlatList
        data={posts}
        keyExtractor={(item) => `post-${item.postId}`}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => onNavigateToPostDetail(item.postId)}
            onLikePress={() => handleLikeToggle(item.postId, item.isLikedByMe || false)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>게시글이 없습니다</Text>
              <Text style={styles.emptySubText}>첫 번째 게시글을 작성해보세요!</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator size="small" color="#FF8A3D" style={styles.loadingFooter} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF8A3D']}
            tintColor="#FF8A3D"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      {/* 글쓰기 버튼 */}
      <TouchableOpacity
        style={styles.writeButton}
        onPress={handleWritePost}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
        <Text style={styles.writeButtonText}>게시글 작성</Text>
      </TouchableOpacity>

      {/* 로딩 오버레이 */}
      {loading && page === 1 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF8A3D" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#FF8A3D',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 13,
    color: '#BBB',
    marginTop: 8,
  },
  loadingFooter: {
    paddingVertical: 20,
  },
  writeButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#FF8A3D',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommunityScreen;
