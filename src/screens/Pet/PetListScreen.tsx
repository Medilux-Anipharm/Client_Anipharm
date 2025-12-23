/**
 * PetListScreen
 * 반려동물 목록 화면 (여러 프로필 표시 및 전환)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPets, setPrimaryPet, deletePet } from '../../services/pet';
import { Pet } from '../../types/pet';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

interface PetListScreenProps {
  onNavigateBack: () => void;
  onNavigateToDetail: (petId: number) => void;
  onNavigateToCreate: () => void;
}

const PetListScreen: React.FC<PetListScreenProps> = ({
  onNavigateBack,
  onNavigateToDetail,
  onNavigateToCreate,
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  /**
   * 반려동물 목록 조회
   */
  const fetchPets = async () => {
    try {
      const response = await getPets();
      if (response.success) {
        setPets(response.data);
      }
    } catch (error: any) {
      console.error('반려동물 목록 조회 에러:', error);
      Alert.alert('오류', '반려동물 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  /**
   * 새로고침
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  /**
   * 대표 반려동물 설정
   */
  const handleSetPrimary = async (petId: number) => {
    try {
      const response = await setPrimaryPet(petId);
      if (response.success) {
        // 목록 새로고침
        await fetchPets();
        Alert.alert('완료', '대표 반려동물이 설정되었습니다.');
      }
    } catch (error: any) {
      console.error('대표 반려동물 설정 에러:', error);
      Alert.alert('오류', '대표 반려동물 설정에 실패했습니다.');
    }
  };

  /**
   * 삭제 확인 모달 열기
   */
  const handleDeletePress = (petId: number) => {
    setSelectedPetId(petId);
    setDeleteModalVisible(true);
  };

  /**
   * 반려동물 삭제
   */
  const handleDelete = async () => {
    if (!selectedPetId) return;

    setDeleting(true);
    try {
      const response = await deletePet(selectedPetId);
      if (response.success) {
        setDeleteModalVisible(false);
        setSelectedPetId(null);
        // 목록 새로고침
        await fetchPets();
        Alert.alert('완료', '반려동물이 삭제되었습니다.');
      }
    } catch (error: any) {
      console.error('반려동물 삭제 에러:', error);
      Alert.alert('오류', '반려동물 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  /**
   * 나이 계산
   */
  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1}세`;
    }
    return `${age}세`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>반려동물 관리</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8A3D" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>반려동물 관리</Text>
        <TouchableOpacity onPress={onNavigateToCreate} style={styles.addButton}>
          <Ionicons name="add" size={28} color="#FF8A3D" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF8A3D']}
            tintColor="#FF8A3D"
          />
        }
      >
        {pets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>등록된 반려동물이 없습니다</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={onNavigateToCreate}
            >
              <Text style={styles.emptyButtonText}>반려동물 등록하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.petsContainer}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.petId}
                style={styles.petCard}
                onPress={() => onNavigateToDetail(pet.petId)}
                activeOpacity={0.8}
              >
                {/* 프로필 이미지 */}
                <View style={styles.imageContainer}>
                  {pet.profileImageUrl ? (
                    <Image
                      source={{ uri: pet.profileImageUrl }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.defaultImageContainer}>
                      <Ionicons
                        name="paw"
                        size={32}
                        color="#999"
                      />
                    </View>
                  )}
                  {pet.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Ionicons name="star" size={12} color="#fff" />
                    </View>
                  )}
                </View>

                {/* 정보 */}
                <View style={styles.petInfo}>
                  <View style={styles.petHeader}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    {pet.isPrimary && (
                      <View style={styles.primaryLabel}>
                        <Text style={styles.primaryLabelText}>대표</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.petDetails}>
                    {pet.species} · {calculateAge(pet.birthDate)}
                  </Text>
                  {pet.breed && (
                    <Text style={styles.petBreed}>{pet.breed}</Text>
                  )}
                </View>

                {/* 액션 버튼 */}
                <View style={styles.actionButtons}>
                  {!pet.isPrimary && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(pet.petId);
                      }}
                    >
                      <Ionicons name="star-outline" size={20} color="#FF8A3D" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeletePress(pet.petId);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        title="반려동물 삭제"
        message="정말로 이 반려동물을 삭제하시겠습니까?\n삭제된 정보는 복구할 수 없습니다."
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedPetId(null);
        }}
        confirmText="삭제"
        cancelText="취소"
      />
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF8A3D',
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  petsContainer: {
    gap: 12,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  defaultImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF8A3D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  petInfo: {
    flex: 1,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  primaryLabel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFF5EF',
    borderRadius: 8,
  },
  primaryLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF8A3D',
  },
  petDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
});

export default PetListScreen;


