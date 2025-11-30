/**
 * SignUpScreen
 * 다단계 이메일/비밀번호 기반 회원가입 화면
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
import { register } from '../../services/auth.service';
import { RegisterRequest } from '../../types/auth.types';

type SignUpStep = 'email' | 'password' | 'passwordConfirm' | 'nickname';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
}

const SignUpScreen = ({ onNavigateToLogin }: SignUpScreenProps) => {
  // 현재 단계
  const [currentStep, setCurrentStep] = useState<SignUpStep>('email');

  // 입력 필드 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 에러 상태
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  /**
   * 진행률 계산
   */
  const getProgress = (): number => {
    const steps: SignUpStep[] = ['email', 'password', 'passwordConfirm', 'nickname'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

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
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!value) {
      setPasswordError('비밀번호를 입력해주세요.');
      return false;
    } else if (!passwordRegex.test(value)) {
      setPasswordError('영문+숫자+특수문자를 포함한 최소 8글자를 입력해주세요.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  /**
   * 비밀번호 확인 유효성 검사
   */
  const validatePasswordConfirm = (value: string): boolean => {
    if (!value) {
      setPasswordConfirmError('비밀번호를 입력해주세요.');
      return false;
    } else if (password !== value) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    setPasswordConfirmError('');
    return true;
  };

  /**
   * 닉네임 유효성 검사
   */
  const validateNickname = (value: string): boolean => {
    const nicknameRegex = /^[a-zA-Z0-9가-힣_]{2,20}$/;
    if (!value) {
      setNicknameError('닉네임을 입력해주세요.');
      return false;
    } else if (!nicknameRegex.test(value)) {
      setNicknameError('특수문자를 제외한 2-20자내로 입력해주세요.');
      return false;
    }
    setNicknameError('');
    return true;
  };

  /**
   * 다음 단계로 이동
   */
  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 'email':
        isValid = validateEmail(email);
        if (isValid) {
          setCurrentStep('password');
        }
        break;

      case 'password':
        isValid = validatePassword(password);
        if (isValid) {
          setCurrentStep('passwordConfirm');
        }
        break;

      case 'passwordConfirm':
        isValid = validatePasswordConfirm(passwordConfirm);
        if (isValid) {
          setCurrentStep('nickname');
        }
        break;

      case 'nickname':
        isValid = validateNickname(nickname);
        if (isValid) {
          await handleSignUp();
        }
        break;
    }
  };

  /**
   * 이전 단계로 이동
   */
  const handleBack = () => {
    switch (currentStep) {
      case 'password':
        setCurrentStep('email');
        setPasswordError('');
        break;
      case 'passwordConfirm':
        setCurrentStep('password');
        setPasswordConfirmError('');
        break;
      case 'nickname':
        setCurrentStep('passwordConfirm');
        setNicknameError('');
        break;
      case 'email':
        // 첫 화면에서는 뒤로가기 없음
        break;
    }
  };

  /**
   * 회원가입 처리
   */
  const handleSignUp = async () => {
    setLoading(true);

    try {
      const requestData: RegisterRequest = {
        email,
        password,
        passwordConfirm,
        nickname,
      };

      const response = await register(requestData);

      if (response.success) {
        Alert.alert(
          '회원가입 성공',
          response.message,
          [
            {
              text: '확인',
              onPress: () => {
                // 로그인 화면으로 이동
                onNavigateToLogin();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('회원가입 에러:', error);

      let errorMessage = '회원가입 중 오류가 발생했습니다.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 버튼 활성화 여부
   */
  const isButtonEnabled = (): boolean => {
    switch (currentStep) {
      case 'email':
        return email.length > 0;
      case 'password':
        return password.length > 0;
      case 'passwordConfirm':
        return passwordConfirm.length > 0;
      case 'nickname':
        return nickname.length > 0;
      default:
        return false;
    }
  };

  /**
   * 현재 단계의 렌더링
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="JohnDoe1234"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>
        );

      case 'password':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.inputDisabled}
                value={email}
                editable={false}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, passwordError ? styles.inputError : null]}
                  placeholder="영문-숫자-특수문자를 포함한 최소 8글자"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
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
            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="영문-숫자-특수문자를 포함한 최소 8글자"
                editable={false}
              />
            </View>
          </>
        );

      case 'passwordConfirm':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.inputDisabled}
                value={email}
                editable={false}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  secureTextEntry={true}
                  editable={false}
                />
                <TouchableOpacity style={styles.eyeIcon} disabled>
                  <Ionicons name="eye-outline" size={24} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, passwordConfirmError ? styles.inputError : null]}
                  placeholder="비밀번호를 입력해주세요."
                  value={passwordConfirm}
                  onChangeText={(text) => {
                    setPasswordConfirm(text);
                    if (passwordConfirmError) validatePasswordConfirm(text);
                  }}
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
              {passwordConfirmError ? (
                <Text style={styles.errorText}>{passwordConfirmError}</Text>
              ) : null}
            </View>
          </>
        );

      case 'nickname':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={[styles.input, nicknameError ? styles.inputError : null]}
              placeholder="특수문자를 제외한 2-20자내로 입력해주세요."
              value={nickname}
              onChangeText={(text) => {
                setNickname(text);
                if (nicknameError) validateNickname(text);
              }}
              autoCapitalize="none"
              editable={!loading}
            />
            {nicknameError ? <Text style={styles.errorText}>{nicknameError}</Text> : null}
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 프로그레스 바 */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${getProgress()}%` }]} />
      </View>

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

          {/* 현재 단계 렌더링 */}
          {renderCurrentStep()}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isButtonEnabled() || loading ? styles.nextButtonDisabled : null,
          ]}
          onPress={handleNext}
          disabled={!isButtonEnabled() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>다음으로</Text>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF8A3D',
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 24,
    paddingTop: 32,
  },
  titleContainer: {
    marginBottom: 40,
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
  inputDisabled: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    color: '#999',
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
  nextButton: {
    height: 56,
    backgroundColor: '#FF8A3D',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#FFD4B8',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUpScreen;
