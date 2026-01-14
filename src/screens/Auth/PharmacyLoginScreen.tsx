/**
 * PharmacyLoginScreen
 * 약국 로그인 화면
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
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PharmacyLoginScreenProps {
  onNavigateToSignUp: () => void;
  onNavigateBack: () => void;
  onLoginSuccess?: (pharmacyData: any) => void;
}

const PharmacyLoginScreen = ({
  onNavigateToSignUp,
  onNavigateBack,
  onLoginSuccess
}: PharmacyLoginScreenProps) => {
  // 입력 필드 상태
  const [pharmacyEmail, setPharmacyEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 에러 상태
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /**
   * 이메일 유효성 검사
   */
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('이메일을 입력해주세요.');
      return false;
    } else if (!emailRegex.test(value)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    setEmailError('');
    return true;
  };

  /**
   * 비밀번호 유효성 검사
   */
  const validatePassword = (value: string): boolean => {
    if (!value || value.trim() === '') {
      setPasswordError('비밀번호를 입력해주세요.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  /**
   * 로그인 처리
   */
  const handleLogin = async () => {
    console.log('[PharmacyLogin] 로그인 시도 시작');
    console.log('[PharmacyLogin] 이메일:', pharmacyEmail);

    // 유효성 검사
    const isEmailValid = validateEmail(pharmacyEmail);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      console.log('[PharmacyLogin] 유효성 검사 실패');
      return;
    }

    setLoading(true);
    console.log('[PharmacyLogin] API 요청 시작');

    try {
      // TODO: API_BASE_URL을 환경변수로 관리
      const response = await fetch('http://localhost:3000/api/pharmacies/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pharmacyEmail,
          password,
        }),
      });

      console.log('[PharmacyLogin] 응답 상태:', response.status);
      const data = await response.json();
      console.log('[PharmacyLogin] 응답 데이터:', JSON.stringify(data, null, 2));

      if (data.success && data.data) {
        console.log('[PharmacyLogin] 로그인 성공, 토큰 저장 시작');

        // 토큰 저장
        await AsyncStorage.setItem('pharmacyToken', data.data.token);
        await AsyncStorage.setItem('pharmacyData', JSON.stringify(data.data.pharmacy));

        console.log('[PharmacyLogin] 토큰 저장 완료');
        console.log('[PharmacyLogin] 약국 데이터:', data.data.pharmacy);
        console.log('[PharmacyLogin] onLoginSuccess 호출 시작');

        // Alert 없이 바로 페이지 이동
        console.log('[PharmacyLogin] onLoginSuccess 호출');
        onLoginSuccess?.(data.data);
        console.log('[PharmacyLogin] onLoginSuccess 호출 완료');
      } else {
        console.error('[PharmacyLogin] 로그인 실패 - success가 false이거나 data가 없음');
        console.error('[PharmacyLogin] 응답 메시지:', data.message);
        Alert.alert('로그인 실패', data.message || '로그인 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('[PharmacyLogin] 로그인 예외 발생');
      console.error('[PharmacyLogin] 에러 타입:', error.name);
      console.error('[PharmacyLogin] 에러 메시지:', error.message);
      console.error('[PharmacyLogin] 에러 스택:', error.stack);

      if (error.message === 'Network request failed') {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        Alert.alert('로그인 실패', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
      console.log('[PharmacyLogin] 로그인 프로세스 종료');
    }
  };

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
        <Text style={styles.headerTitle}>약국 로그인</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={48} color="#FF8A3D" />
          </View>
          <Text style={styles.logoText}>AniPharm</Text>
          <Text style={styles.logoSubtext}>약국 관리자</Text>
        </View>

        {/* 로그인 폼 */}
        <View style={styles.formContainer}>
          {/* 이메일 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="pharmacy@example.com"
                placeholderTextColor="#999"
                value={pharmacyEmail}
                onChangeText={(text) => {
                  setPharmacyEmail(text);
                  if (emailError) validateEmail(text);
                }}
                onBlur={() => validateEmail(pharmacyEmail)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                }}
                onBlur={() => validatePassword(password)}
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
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.loginButton, loading ? styles.loginButtonDisabled : null]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          {/* 회원가입 링크 */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>약국 계정이 없으신가요?</Text>
            <TouchableOpacity onPress={onNavigateToSignUp} disabled={loading}>
              <Text style={styles.signUpLink}>회원가입</Text>
            </TouchableOpacity>
          </View>

          {/* 테스트 계정 안내 */}
          <View style={styles.testAccountContainer}>
            <Text style={styles.testAccountTitle}>테스트 계정</Text>
            <Text style={styles.testAccountText}>
              이메일: pharmacy1@anipharm.com
            </Text>
            <Text style={styles.testAccountText}>
              비밀번호: Password123!
            </Text>
            <TouchableOpacity
              style={styles.autoFillButton}
              onPress={() => {
                setPharmacyEmail('pharmacy1@anipharm.com');
                setPassword('Password123!');
              }}
            >
              <Text style={styles.autoFillButtonText}>자동 입력</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF8A3D',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    paddingHorizontal: 24,
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
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 1.5,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 6,
    marginLeft: 4,
  },
  loginButton: {
    height: 56,
    backgroundColor: '#FF8A3D',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#FFD4B8',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  testAccountContainer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  testAccountTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  testAccountText: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 4,
  },
  autoFillButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    alignSelf: 'flex-start',
  },
  autoFillButtonText: {
    fontSize: 13,
    color: '#FF8A3D',
    fontWeight: '500',
  },
});

export default PharmacyLoginScreen;
