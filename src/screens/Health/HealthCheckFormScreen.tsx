/**
 * HealthCheckFormScreen
 * 건강 체크표 작성 화면
 */

import React, { useState } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { startHealthStatusChat, HealthCheckData } from '../../services/healthChatbot';
import { getPets } from '../../services/pet';
import { Pet } from '../../types/pet';

interface HealthCheckFormScreenProps {
  petId?: number;
  onNavigateBack: () => void;
  onComplete: (petId: number, healthCheckId: number) => void;
}

// 건강 고민 옵션 (백엔드 CONCERN_LABELS와 일치해야 함)
const HEALTH_CONCERN_OPTIONS = [
  '치아/구강',
  '뼈/관절',
  '피부/미모',
  '눈',
  '신장/요로',
  '구토',
  '노화',
  '영양',
  '심장',
  '비만',
  '면역력',
];

// 식욕 옵션
const APPETITE_OPTIONS: HealthCheckData['appetite'][] = [
  '정상',
  '감소',
  '거의 안 먹음',
  '증가',
];

// 활동 옵션
const ACTIVITY_OPTIONS: HealthCheckData['activity'][] = [
  '정상',
  '감소',
  '매우 무기력',
  '과도하게 활동적',
];

// 체온 옵션
const TEMPERATURE_OPTIONS: HealthCheckData['temperature'][] = [
  '정상(37.5~39.2)',
  '낮음(≤37)',
  '높음(≥39.5)',
  '미측정',
];

const HealthCheckFormScreen = ({
  petId,
  onNavigateBack,
  onComplete,
}: HealthCheckFormScreenProps) => {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(petId || null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);

  // 건강 체크표 상태
  const [concernType, setConcernType] = useState<string[]>([]);
  const [appetite, setAppetite] = useState<HealthCheckData['appetite'] | ''>('');
  const [activity, setActivity] = useState<HealthCheckData['activity'] | ''>('');
  const [temperature, setTemperature] = useState<HealthCheckData['temperature'] | ''>('');
  const [note, setNote] = useState('');

  // 에러 상태
  const [errors, setErrors] = useState<{
    petId?: string;
    concernType?: string;
    appetite?: string;
    activity?: string;
    temperature?: string;
  }>({});

  // 반려동물 목록 로드
  React.useEffect(() => {
    const loadPets = async () => {
      if (petId) {
        setSelectedPetId(Number(petId));
        return;
      }
      try {
        setLoadingPets(true);
        const response = await getPets();
        if (response.success && response.data) {
          setPets(response.data);
          if (response.data.length > 0 && !selectedPetId) {
            const primaryPet = response.data.find((p) => p.isPrimary) || response.data[0];
            setSelectedPetId(Number(primaryPet.petId));
          }
        }
      } catch (error) {
        console.error('반려동물 목록 로드 실패:', error);
        Alert.alert('오류', '반려동물 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoadingPets(false);
      }
    };
    loadPets();
  }, [petId]);

  /**
   * 건강 고민 선택/해제
   */
  const handleConcernToggle = (concern: string) => {
    if (concernType.includes(concern)) {
      setConcernType(concernType.filter((c) => c !== concern));
    } else {
      if (concernType.length >= 5) {
        Alert.alert('알림', '건강 고민은 최대 5개까지 선택할 수 있습니다.');
        return;
      }
      setConcernType([...concernType, concern]);
    }
    if (errors.concernType) {
      setErrors({ ...errors, concernType: undefined });
    }
  };

  /**
   * 유효성 검사
   */
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!selectedPetId) {
      newErrors.petId = '반려동물을 선택해주세요.';
    }
    if (concernType.length === 0) {
      newErrors.concernType = '건강 고민을 최소 1개 이상 선택해주세요.';
    }
    if (!appetite) {
      newErrors.appetite = '식욕 상태를 선택해주세요.';
    }
    if (!activity) {
      newErrors.activity = '활동 상태를 선택해주세요.';
    }
    if (!temperature) {
      newErrors.temperature = '체온을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 건강 체크표 제출 (메모가 100자 이상이면 사용자 입력 없이 다음 단계로 진행)
   */
  const handleSubmit = async (skipUserInput = false) => {
    if (!validate()) {
      Alert.alert('알림', '건강체크표를 완료해주세요.');
      return;
    }

    if (!selectedPetId) {
      return;
    }

    // 메모가 100자 이상이면 사용자 입력 없이 바로 대화 시작
    const shouldSkipUserInput = note.trim().length >= 100;

    try {
      setLoading(true);
      const healthCheckData: HealthCheckData = {
        concernType,
        appetite: appetite as HealthCheckData['appetite'],
        activity: activity as HealthCheckData['activity'],
        temperature: temperature as HealthCheckData['temperature'],
        note: note.trim() || undefined,
      };

      const response = await startHealthStatusChat({
        petId: selectedPetId,
        healthCheckData,
      });

      if (response.success && response.data) {
        if (!selectedPetId) {
          throw new Error('반려동물이 선택되지 않았습니다.');
        }
        // healthCheckId를 숫자로 변환
        const healthCheckId = Number(response.data.healthCheckId);
        if (isNaN(healthCheckId)) {
          throw new Error('유효하지 않은 건강 체크표 ID입니다.');
        }

        // 메모가 100자 이상이면 자동으로 다음 단계로 진행
        if (shouldSkipUserInput) {
          Alert.alert(
            '알림',
            '입력하신 정보가 충분합니다. AI 분석을 시작합니다.',
            [
              {
                text: '확인',
                onPress: () => onComplete(selectedPetId, healthCheckId),
              },
            ]
          );
        } else {
          onComplete(selectedPetId, healthCheckId);
        }
      } else {
        throw new Error(response.message || '건강 상태 상담 시작에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('건강 체크표 제출 실패:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || error.message || '건강 체크표 제출에 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>건강 상태 체크</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 반려동물 선택 (petId가 없을 때만 표시) */}
          {!petId && (
            <View style={styles.section}>
              <Text style={styles.label}>반려동물 선택 *</Text>
              {loadingPets ? (
                <ActivityIndicator size="small" color="#FF8A3D" />
              ) : (
                <View style={styles.petSelector}>
                  {pets.map((pet) => (
                    <TouchableOpacity
                      key={pet.petId}
                      style={[
                        styles.petOption,
                        selectedPetId === Number(pet.petId) && styles.petOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedPetId(Number(pet.petId));
                        if (errors.petId) {
                          setErrors({ ...errors, petId: undefined });
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.petOptionText,
                          selectedPetId === Number(pet.petId) && styles.petOptionTextActive,
                        ]}
                      >
                        {pet.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.petId && <Text style={styles.errorText}>{errors.petId}</Text>}
            </View>
          )}

          {/* 건강 고민 선택 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              건강 고민 * (최대 5개까지 선택 가능)
            </Text>
            <View style={styles.chipContainer}>
              {HEALTH_CONCERN_OPTIONS.map((concern) => (
                <TouchableOpacity
                  key={concern}
                  style={[
                    styles.chip,
                    concernType.includes(concern) && styles.chipActive,
                  ]}
                  onPress={() => handleConcernToggle(concern)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      concernType.includes(concern) && styles.chipTextActive,
                    ]}
                  >
                    {concern}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.concernType && (
              <Text style={styles.errorText}>{errors.concernType}</Text>
            )}
          </View>

          {/* 식욕 상태 */}
          <View style={styles.section}>
            <Text style={styles.label}>식욕 상태 *</Text>
            <View style={styles.optionContainer}>
              {APPETITE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    appetite === option && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    setAppetite(option);
                    if (errors.appetite) {
                      setErrors({ ...errors, appetite: undefined });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      appetite === option && styles.optionButtonTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.appetite && <Text style={styles.errorText}>{errors.appetite}</Text>}
          </View>

          {/* 활동 상태 */}
          <View style={styles.section}>
            <Text style={styles.label}>활동 상태 *</Text>
            <View style={styles.optionContainer}>
              {ACTIVITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    activity === option && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    setActivity(option);
                    if (errors.activity) {
                      setErrors({ ...errors, activity: undefined });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      activity === option && styles.optionButtonTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.activity && <Text style={styles.errorText}>{errors.activity}</Text>}
          </View>

          {/* 체온 */}
          <View style={styles.section}>
            <Text style={styles.label}>체온 *</Text>
            <View style={styles.optionContainer}>
              {TEMPERATURE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    temperature === option && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    setTemperature(option);
                    if (errors.temperature) {
                      setErrors({ ...errors, temperature: undefined });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      temperature === option && styles.optionButtonTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.temperature && (
              <Text style={styles.errorText}>{errors.temperature}</Text>
            )}
          </View>

          {/* 추가 메모 */}
          <View style={styles.section}>
            <Text style={styles.label}>추가 메모 (선택)</Text>
            <TextInput
              style={styles.textArea}
              value={note}
              onChangeText={setNote}
              placeholder="증상이나 상태에 대해 자세히 설명해주세요"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>상담 시작하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FF8A3D',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  petSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  petOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  petOptionActive: {
    borderColor: '#FF8A3D',
    borderWidth: 2,
    backgroundColor: '#FFF5EF',
  },
  petOptionText: {
    fontSize: 14,
    color: '#666',
  },
  petOptionTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  chipActive: {
    borderColor: '#FF8A3D',
    borderWidth: 1.5,
    backgroundColor: '#FFF5EF',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextActive: {
    color: '#FF8A3D',
    fontWeight: '500',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    minWidth: 100,
  },
  optionButtonActive: {
    borderColor: '#FF8A3D',
    borderWidth: 2,
    backgroundColor: '#FFF5EF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  optionButtonTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 6,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
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
});

export default HealthCheckFormScreen;

