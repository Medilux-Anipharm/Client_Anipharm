/**
 * PharmacySignUpScreen
 * 약국 회원가입 화면
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PharmacySignUpScreenProps {
  onNavigateToLogin: () => void;
  onSignUpSuccess?: () => void;
}

const PharmacySignUpScreen = ({ onNavigateToLogin, onSignUpSuccess }: PharmacySignUpScreenProps) => {
  // 입력 필드 상태
  const [pharmacyEmail, setPharmacyEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [website, setWebsite] = useState('');

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 에러 상태
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  /**
   * 사업자번호 포맷팅 (XXX-XX-XXXXX)
   */
  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
  };

  /**
   * 전화번호 포맷팅
   */
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  /**
   * 유효성 검사
   */
  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pharmacyEmail) {
      newErrors.pharmacyEmail = '이메일을 입력해주세요.';
    } else if (!emailRegex.test(pharmacyEmail)) {
      newErrors.pharmacyEmail = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = '영문+숫자+특수문자를 포함한 최소 8글자를 입력해주세요.';
    }

    // 비밀번호 확인
    if (!passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호를 입력해주세요.';
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    // 사업자번호 검증 (10자리)
    const businessNumberOnly = businessNumber.replace(/[^\d]/g, '');
    if (!businessNumber) {
      newErrors.businessNumber = '사업자번호를 입력해주세요.';
    } else if (businessNumberOnly.length !== 10) {
      newErrors.businessNumber = '사업자번호는 10자리여야 합니다.';
    }

    // 약국명 검증
    if (!name) {
      newErrors.name = '약국명을 입력해주세요.';
    }

    // 전화번호 검증
    if (!phone) {
      newErrors.phone = '전화번호를 입력해주세요.';
    }

    // 주소 검증
    if (!address) {
      newErrors.address = '주소를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 회원가입 처리
   */
  const handleSignUp = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: API 호출로 변경
      // 임시로 위도/경도는 서울 중심으로 설정
      const response = await fetch('http://localhost:3000/api/pharmacies/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pharmacyEmail,
          password,
          passwordConfirm,
          businessNumber: businessNumber.replace(/[^\d]/g, ''),
          name,
          phone: phone.replace(/[^\d]/g, ''),
          address,
          addressDetail,
          latitude: 37.5665,
          longitude: 126.9780,
          operatingHours,
          website,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('회원가입 완료', '약국 회원가입이 완료되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              onSignUpSuccess?.();
              onNavigateToLogin();
            },
          },
        ]);
      } else {
        Alert.alert('회원가입 실패', data.message || '회원가입 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      Alert.alert('회원가입 실패', '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateToLogin} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>약국 회원가입</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* 이메일 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일 *</Text>
            <TextInput
              style={[styles.input, errors.pharmacyEmail ? styles.inputError : null]}
              placeholder="pharmacy@example.com"
              value={pharmacyEmail}
              onChangeText={setPharmacyEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.pharmacyEmail ? <Text style={styles.errorText}>{errors.pharmacyEmail}</Text> : null}
          </View>

          {/* 비밀번호 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                placeholder="영문+숫자+특수문자 포함 8글자 이상"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 확인 *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.passwordConfirm ? styles.inputError : null]}
                placeholder="비밀번호를 다시 입력해주세요"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry={!showPasswordConfirm}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                <Ionicons
                  name={showPasswordConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {errors.passwordConfirm ? <Text style={styles.errorText}>{errors.passwordConfirm}</Text> : null}
          </View>

          {/* 사업자번호 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>사업자 등록번호 *</Text>
            <TextInput
              style={[styles.input, errors.businessNumber ? styles.inputError : null]}
              placeholder="123-45-67890"
              value={businessNumber}
              onChangeText={(text) => setBusinessNumber(formatBusinessNumber(text))}
              keyboardType="number-pad"
              maxLength={12}
              editable={!loading}
            />
            {errors.businessNumber ? <Text style={styles.errorText}>{errors.businessNumber}</Text> : null}
          </View>

          {/* 약국명 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>약국명 *</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="OO동물약국"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* 전화번호 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>전화번호 *</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              placeholder="010-1234-5678"
              value={phone}
              onChangeText={(text) => setPhone(formatPhoneNumber(text))}
              keyboardType="phone-pad"
              maxLength={13}
              editable={!loading}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* 주소 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>주소 *</Text>
            <TextInput
              style={[styles.input, errors.address ? styles.inputError : null]}
              placeholder="서울특별시 강남구 테헤란로 123"
              value={address}
              onChangeText={setAddress}
              editable={!loading}
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>

          {/* 상세주소 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>상세주소</Text>
            <TextInput
              style={styles.input}
              placeholder="1층 101호"
              value={addressDetail}
              onChangeText={setAddressDetail}
              editable={!loading}
            />
          </View>

          {/* 운영시간 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>운영시간</Text>
            <TextInput
              style={styles.input}
              placeholder="평일 09:00-18:00"
              value={operatingHours}
              onChangeText={setOperatingHours}
              editable={!loading}
            />
          </View>

          {/* 홈페이지 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>홈페이지</Text>
            <TextInput
              style={styles.input}
              placeholder="https://www.example.com"
              value={website}
              onChangeText={setWebsite}
              keyboardType="url"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
        </View>
      </ScrollView>

      {/* 가입하기 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading ? styles.submitButtonDisabled : null]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>가입하기</Text>
          )}
        </TouchableOpacity>
      </View>
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
    marginLeft: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 1.5,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 6,
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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

export default PharmacySignUpScreen;
