/**
 * PetDetailScreen
 * 반려동물 상세/수정 화면
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getPet, updatePet, setPrimaryPet } from '../../services/pet';
import {
  Pet,
  PetSpecies,
  HealthConcern,
  HEALTH_CONCERN_LABELS,
  UpdatePetRequest,
} from '../../types/pet';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { deletePet } from '../../services/pet';

// 웹용 날짜 입력 컴포넌트
const WebDateInput = ({ value, onChange, hasError, disabled }: any) => {
  if (Platform.OS !== 'web') return null;

  return (
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        height: '52px',
        border: hasError ? '1.5px solid #FF4444' : '1px solid #E0E0E0',
        borderRadius: '12px',
        padding: '0 16px',
        fontSize: '16px',
        backgroundColor: disabled ? '#F5F5F5' : '#fff',
        color: disabled ? '#999' : '#000',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      max={new Date().toISOString().split('T')[0]}
    />
  );
};

interface PetDetailScreenProps {
  petId: number;
  onNavigateBack: () => void;
  onNavigateToList: () => void;
}

const PetDetailScreen: React.FC<PetDetailScreenProps> = ({
  petId,
  onNavigateBack,
  onNavigateToList,
}) => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 수정 필드 상태
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [species, setSpecies] = useState<PetSpecies>('강아지');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<string>('');
  const [weight, setWeight] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [healthConcerns, setHealthConcerns] = useState<HealthConcern[]>([]);

  // 에러 상태
  const [nameError, setNameError] = useState('');
  const [birthDateError, setBirthDateError] = useState('');

  // 건강 고민 목록
  const healthConcernOptions: HealthConcern[] = [
    'dental',
    'joint',
    'skin',
    'eye',
    'kidney',
    'vomit',
    'aging',
    'nutrition',
    'heart',
    'obesity',
    'constipation',
    'immunity',
  ];

  /**
   * 반려동물 정보 조회
   */
  const fetchPet = async () => {
    try {
      setLoading(true);
      const response = await getPet(petId);
      if (response.success) {
        const petData = response.data;
        setPet(petData);
        // 수정 모드용 상태 초기화
        setName(petData.name);
        setBirthDate(petData.birthDate);
        setDate(new Date(petData.birthDate));
        setSpecies(petData.species);
        setBreed(petData.breed || '');
        setGender(petData.gender || '');
        setWeight(petData.weight?.toString() || '');
        setProfileImageUrl(petData.profileImageUrl || null);
        setHealthConcerns(petData.healthConcerns || []);
      }
    } catch (error: any) {
      console.error('반려동물 조회 에러:', error);
      Alert.alert('오류', '반려동물 정보를 불러오는데 실패했습니다.');
      onNavigateBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
  }, [petId]);

  /**
   * 이름 유효성 검사
   */
  const validateName = (value: string): boolean => {
    if (!value || value.trim() === '') {
      setNameError('반려동물 이름을 입력해주세요.');
      return false;
    } else if (value.length > 10) {
      setNameError('이름은 최대 10자까지 입력 가능합니다.');
      return false;
    }
    setNameError('');
    return true;
  };

  /**
   * 생년월일 유효성 검사
   */
  const validateBirthDate = (value: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!value) {
      setBirthDateError('생년월일을 입력해주세요.');
      return false;
    } else if (!dateRegex.test(value)) {
      setBirthDateError('올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)');
      return false;
    }

    const birthDateObj = new Date(value);
    const today = new Date();
    if (birthDateObj > today) {
      setBirthDateError('생년월일은 오늘 이전 날짜여야 합니다.');
      return false;
    }

    setBirthDateError('');
    return true;
  };

  /**
   * 프로필 사진 선택
   */
  const handleImagePicker = () => {
    // TODO: 이미지 피커 구현 (expo-image-picker)
    Alert.alert('알림', '이미지 업로드 기능은 준비중입니다.');
  };

  /**
   * 날짜 선택 처리
   */
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setBirthDate(formattedDate);
      setBirthDateError('');
    }
  };

  /**
   * 건강 고민 토글
   */
  const toggleHealthConcern = (concern: HealthConcern) => {
    if (healthConcerns.includes(concern)) {
      setHealthConcerns(healthConcerns.filter((c) => c !== concern));
    } else {
      if (healthConcerns.length >= 5) {
        Alert.alert('알림', '건강 고민은 최대 5개까지 선택 가능합니다.');
        return;
      }
      setHealthConcerns([...healthConcerns, concern]);
    }
  };

  /**
   * 수정 모드 토글
   */
  const handleToggleEdit = () => {
    if (isEditMode) {
      // 취소 시 원래 데이터로 복원
      if (pet) {
        setName(pet.name);
        setBirthDate(pet.birthDate);
        setDate(new Date(pet.birthDate));
        setSpecies(pet.species);
        setBreed(pet.breed || '');
        setGender(pet.gender || '');
        setWeight(pet.weight?.toString() || '');
        setProfileImageUrl(pet.profileImageUrl || null);
        setHealthConcerns(pet.healthConcerns || []);
        setNameError('');
        setBirthDateError('');
      }
    }
    setIsEditMode(!isEditMode);
  };

  /**
   * 반려동물 정보 수정
   */
  const handleUpdatePet = async () => {
    // 유효성 검사
    const isNameValid = validateName(name);
    const isBirthDateValid = validateBirthDate(birthDate);

    if (!isNameValid || !isBirthDateValid) {
      return;
    }

    setSaving(true);

    try {
      const updateData: UpdatePetRequest = {
        name: name.trim(),
        species,
        birthDate,
        breed: breed.trim() || undefined,
        gender: (gender as any) || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        profileImageUrl: profileImageUrl || undefined,
        healthConcerns: healthConcerns.length > 0 ? healthConcerns : undefined,
      };

      const response = await updatePet(petId, updateData);

      if (response.success) {
        setIsEditMode(false);
        await fetchPet(); // 최신 데이터로 갱신
        Alert.alert('완료', '반려동물 정보가 수정되었습니다.');
      }
    } catch (error: any) {
      console.error('반려동물 수정 에러:', error);

      let errorMessage = '반려동물 정보 수정에 실패했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('수정 실패', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /**
   * 대표 반려동물 설정
   */
  const handleSetPrimary = async () => {
    try {
      const response = await setPrimaryPet(petId);
      if (response.success) {
        await fetchPet(); // 최신 데이터로 갱신
        Alert.alert('완료', '대표 반려동물이 설정되었습니다.');
      }
    } catch (error: any) {
      console.error('대표 반려동물 설정 에러:', error);
      Alert.alert('오류', '대표 반려동물 설정에 실패했습니다.');
    }
  };

  /**
   * 반려동물 삭제
   */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await deletePet(petId);
      if (response.success) {
        setDeleteModalVisible(false);
        Alert.alert('완료', '반려동물이 삭제되었습니다.', [
          {
            text: '확인',
            onPress: onNavigateToList,
          },
        ]);
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
          <Text style={styles.headerTitle}>반려동물 상세</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8A3D" />
        </View>
      </View>
    );
  }

  if (!pet) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? '반려동물 수정' : '반려동물 상세'}
        </Text>
        {!isEditMode && (
          <TouchableOpacity
            onPress={handleToggleEdit}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={24} color="#FF8A3D" />
          </TouchableOpacity>
        )}
        {isEditMode && (
          <TouchableOpacity
            onPress={handleToggleEdit}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* 프로필 이미지 */}
          <View style={styles.section}>
            <Text style={styles.label}>사진</Text>
            <TouchableOpacity
              style={styles.imagePickerContainer}
              onPress={isEditMode ? handleImagePicker : undefined}
              disabled={!isEditMode}
            >
              {profileImageUrl ? (
                <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.defaultImageContainer}>
                  <Ionicons name="paw" size={40} color="#999" />
                </View>
              )}
              {isEditMode && (
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 이름 */}
          <View style={styles.section}>
            <Text style={styles.label}>이름</Text>
            {isEditMode ? (
              <>
                <TextInput
                  style={[styles.input, nameError ? styles.inputError : null]}
                  placeholder="10자 이내로 입력해주세요."
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) validateName(text);
                  }}
                  maxLength={10}
                  editable={!saving}
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </>
            ) : (
              <Text style={styles.valueText}>{pet.name}</Text>
            )}
          </View>

          {/* 생년월일 */}
          <View style={styles.section}>
            <Text style={styles.label}>생년월일</Text>
            {isEditMode ? (
              <>
                {Platform.OS === 'web' ? (
                  <WebDateInput
                    value={birthDate}
                    onChange={(value: string) => {
                      setBirthDate(value);
                      setBirthDateError('');
                    }}
                    hasError={!!birthDateError}
                    disabled={saving}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.dateInput,
                        birthDateError ? styles.inputError : null,
                      ]}
                      onPress={() => setShowDatePicker(true)}
                      disabled={saving}
                    >
                      <Text style={[styles.dateText, !birthDate && styles.placeholder]}>
                        {birthDate || 'YYYY-MM-DD'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#999" />
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
                {birthDateError ? (
                  <Text style={styles.errorText}>{birthDateError}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.valueText}>
                {pet.birthDate} ({calculateAge(pet.birthDate)})
              </Text>
            )}
          </View>

          {/* 종류 */}
          <View style={styles.section}>
            <Text style={styles.label}>종류</Text>
            {isEditMode ? (
              <View style={styles.speciesContainer}>
                <TouchableOpacity
                  style={[
                    styles.speciesButton,
                    species === '강아지' && styles.speciesButtonActive,
                  ]}
                  onPress={() => setSpecies('강아지')}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.speciesButtonText,
                      species === '강아지' && styles.speciesButtonTextActive,
                    ]}
                  >
                    강아지
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.speciesButton,
                    species === '고양이' && styles.speciesButtonActive,
                  ]}
                  onPress={() => setSpecies('고양이')}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.speciesButtonText,
                      species === '고양이' && styles.speciesButtonTextActive,
                    ]}
                  >
                    고양이
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.valueText}>{pet.species}</Text>
            )}
          </View>

          {/* 품종 */}
          {isEditMode && (
            <View style={styles.section}>
              <Text style={styles.label}>품종 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="품종을 입력해주세요."
                placeholderTextColor="#999"
                value={breed}
                onChangeText={setBreed}
                maxLength={50}
                editable={!saving}
              />
            </View>
          )}

          {/* 건강 고민 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              건강고민{isEditMode ? '(최대 5가지까지 가능)' : ''}
            </Text>
            {isEditMode ? (
              <View style={styles.healthConcernsContainer}>
                {healthConcernOptions.map((concern) => (
                  <TouchableOpacity
                    key={concern}
                    style={[
                      styles.healthConcernChip,
                      healthConcerns.includes(concern) &&
                        styles.healthConcernChipActive,
                    ]}
                    onPress={() => toggleHealthConcern(concern)}
                    disabled={saving}
                  >
                    <Text
                      style={[
                        styles.healthConcernChipText,
                        healthConcerns.includes(concern) &&
                          styles.healthConcernChipTextActive,
                      ]}
                    >
                      {HEALTH_CONCERN_LABELS[concern]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.healthConcernsContainer}>
                {pet.healthConcerns && pet.healthConcerns.length > 0 ? (
                  pet.healthConcerns.map((concern) => (
                    <View key={concern} style={styles.healthConcernChipReadOnly}>
                      <Text style={styles.healthConcernChipTextReadOnly}>
                        {HEALTH_CONCERN_LABELS[concern]}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>등록된 건강 고민이 없습니다.</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      {isEditMode ? (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              saving ? styles.submitButtonDisabled : null,
            ]}
            onPress={handleUpdatePet}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>저장하기</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomContainer}>
          {!pet.isPrimary && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSetPrimary}
            >
              <Ionicons name="star" size={20} color="#FF8A3D" />
              <Text style={styles.primaryButtonText}>대표 반려동물로 설정</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
            <Text style={styles.deleteButtonText}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        title="반려동물 삭제"
        message="정말로 이 반려동물을 삭제하시겠습니까?\n삭제된 정보는 복구할 수 없습니다."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmText="삭제"
        cancelText="취소"
      />
    </KeyboardAvoidingView>
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
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cancelButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  imagePickerContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    position: 'relative',
  },
  defaultImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF8A3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  dateInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  placeholder: {
    color: '#999',
  },
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 6,
  },
  speciesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  speciesButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  speciesButtonActive: {
    borderColor: '#FF8A3D',
    borderWidth: 2,
    backgroundColor: '#FFF5EF',
  },
  speciesButtonText: {
    fontSize: 16,
    color: '#666',
  },
  speciesButtonTextActive: {
    fontSize: 16,
    color: '#FF8A3D',
    fontWeight: '600',
  },
  healthConcernsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  healthConcernChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  healthConcernChipActive: {
    borderColor: '#FF8A3D',
    borderWidth: 1.5,
    backgroundColor: '#FFF5EF',
  },
  healthConcernChipText: {
    fontSize: 14,
    color: '#666',
  },
  healthConcernChipTextActive: {
    fontSize: 14,
    color: '#FF8A3D',
    fontWeight: '500',
  },
  healthConcernChipReadOnly: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  healthConcernChipTextReadOnly: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    gap: 12,
  },
  submitButton: {
    height: 56,
    backgroundColor: '#FF8A3D',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#FFD4B8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#FFF5EF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF8A3D',
  },
  primaryButtonText: {
    color: '#FF8A3D',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PetDetailScreen;

