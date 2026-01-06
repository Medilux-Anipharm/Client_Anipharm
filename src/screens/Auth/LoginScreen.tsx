/**
 * LoginScreen
 * 이메일/비밀번호 기반 로그인 화면
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
import { login } from '../../services/auth';
import { LoginRequest, User } from '../../types/auth';

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
  onLoginSuccess: (user: User) => void;
}

const LoginScreen = ({ onNavigateToSignUp, onLoginSuccess }: LoginScreenProps) => {
  // 입력 필드 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'pharmacy'>('user');

  // 에러 상태
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  /**
   * 이메일 유효성 검사
   */
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
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
      setPasswordError('비밀번호를 입력하세요.');
      return false;
    } else if (value.length < 8) {
      setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  /**
   * 로그인 처리
   */
  const handleLogin = async () => {
    // 에러 초기화
    setGeneralError('');

    // 유효성 검사
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const requestData: LoginRequest = {
        email,
        password,
      };

      const response = await login(requestData);
      console.log('로그인 응답:', response)

      if (response.success) {
        // 로그인 성공 - 바로 페이지 이동
        console.log('로그인 성공! 사용자 데이터:', response.data.user);
        console.log('onLoginSuccess 함수 호출 시작');
        const user = response.data.user;
        console.log('전달할 user:', user);
        onLoginSuccess(user);
        console.log('onLoginSuccess 함수 호출 완료');
      } else {
        console.log('response.success가 false입니다:', response);
      }
    } catch (error: any) {
      console.error('로그인 에러:', error);

      let errorMessage = '잠시 후 다시 시도해주세요.';

      // HTTP 상태 코드에 따른 에러 처리
      if (error.response) {
        const statusCode = error.response.status;

        if (statusCode === 401 || statusCode === 403) {
          // 자격 증명 불일치
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (statusCode >= 500) {
          // 서버 오류
          errorMessage = '잠시 후 다시 시도해주세요.';
        } else if (error.response.data?.message) {
          // 서버에서 제공한 에러 메시지
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        // 네트워크 오류 등
        errorMessage = '잠시 후 다시 시도해주세요.';
      }

      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 버튼 활성화 여부
   */
  const isButtonEnabled = (): boolean => {
    return email.length > 0 && password.length > 0;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 - 뒤로가기 버튼 없음 (첫 화면) */}
      <View style={styles.header} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* 타이틀 */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              <Text style={styles.titleOrange}>Anipharm</Text>
              <Text style={styles.titleBlack}>에</Text>
            </Text>
            <Text style={styles.subtitle}>오신 것을 환영해요!</Text>
          </View>

          {/* 로그인 타입 토글 */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleButtonLeft,
                loginType === 'user' && styles.toggleButtonActive,
              ]}
              onPress={() => setLoginType('user')}
              disabled={loading}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={loginType === 'user' ? '#FF8A3D' : '#999'}
              />
              <Text style={[
                styles.toggleButtonText,
                loginType === 'user' && styles.toggleButtonTextActive,
              ]}>
                사용자 로그인
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleButtonRight,
                loginType === 'pharmacy' && styles.toggleButtonActive,
              ]}
              onPress={() => setLoginType('pharmacy')}
              disabled={loading}
            >
              <Ionicons
                name="storefront-outline"
                size={20}
                color={loginType === 'pharmacy' ? '#FF8A3D' : '#999'}
              />
              <Text style={[
                styles.toggleButtonText,
                loginType === 'pharmacy' && styles.toggleButtonTextActive,
              ]}>
                약국 로그인
              </Text>
            </TouchableOpacity>
          </View>

          {/* 전체 에러 메시지 */}
          {generalError ? (
            <View style={styles.generalErrorContainer}>
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          ) : null}

          {/* 이메일 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="이메일을 입력하세요."
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
                if (generalError) setGeneralError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, passwordError ? styles.inputError : null]}
                placeholder="비밀번호를 입력하세요."
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                  if (generalError) setGeneralError('');
                }}
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
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              !isButtonEnabled() || loading ? styles.loginButtonDisabled : null,
            ]}
            onPress={handleLogin}
            disabled={!isButtonEnabled() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          {/* 하단 링크들 */}
          <View style={styles.linkContainer}>
            <TouchableOpacity onPress={() => Alert.alert('알림', '아이디 찾기 기능 준비중입니다.')}>
              <Text style={styles.linkText}>아이디 찾기</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={() => Alert.alert('알림', '비밀번호 찾기 기능 준비중입니다.')}>
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={onNavigateToSignUp}>
              <Text style={styles.linkText}>회원가입</Text>
            </TouchableOpacity>
          </View>

          {/* SNS 로그인 섹션 */}
          <View style={styles.snsContainer}>
            <Text style={styles.snsTitle}>SNS 계정으로 로그인</Text>
            <View style={styles.snsButtonContainer}>
              {/* Google 로그인 (더미) */}
              <TouchableOpacity
                style={[styles.snsButton, styles.googleButton]}
                onPress={() => Alert.alert('알림', 'Google 로그인은 준비중입니다.')}
              >
                <Ionicons name="logo-google" size={28} color="#DB4437" />
              </TouchableOpacity>

              {/* 카카오 로그인 (더미) */}
              <TouchableOpacity
                style={[styles.snsButton, styles.kakaoButton]}
                onPress={() => Alert.alert('알림', '카카오 로그인은 준비중입니다.')}
              >
                <Ionicons name="chatbubble" size={28} color="#000" />
              </TouchableOpacity>

              {/* Apple 로그인 (더미) */}
              <TouchableOpacity
                style={[styles.snsButton, styles.appleButton]}
                onPress={() => Alert.alert('알림', 'Apple 로그인은 준비중입니다.')}
              >
                <Ionicons name="logo-apple" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 24,
    paddingTop: 32,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  titleOrange: {
    color: '#FF8A3D',
  },
  titleBlack: {
    color: '#000',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonLeft: {
    marginRight: 2,
  },
  toggleButtonRight: {
    marginLeft: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  toggleButtonTextActive: {
    color: '#FF8A3D',
    fontWeight: '600',
  },
  generalErrorContainer: {
    backgroundColor: '#FFE8E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  generalErrorText: {
    fontSize: 14,
    color: '#FF4444',
    textAlign: 'center',
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
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 12,
  },
  snsContainer: {
    alignItems: 'center',
  },
  snsTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  snsButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  snsButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
  },
  appleButton: {
    backgroundColor: '#000',
  },
});

export default LoginScreen;
