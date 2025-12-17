/**
 * SocialLoginButtons Component
 * SNS 로그인 버튼 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialLoginButtonsProps {
  onGooglePress?: () => void;
  onKakaoPress?: () => void;
  onApplePress?: () => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGooglePress,
  onKakaoPress,
  onApplePress,
}) => {
  const handleGooglePress = () => {
    if (onGooglePress) {
      onGooglePress();
    } else {
      Alert.alert('알림', 'Google 로그인은 준비중입니다.');
    }
  };

  const handleKakaoPress = () => {
    if (onKakaoPress) {
      onKakaoPress();
    } else {
      Alert.alert('알림', '카카오 로그인은 준비중입니다.');
    }
  };

  const handleApplePress = () => {
    if (onApplePress) {
      onApplePress();
    } else {
      Alert.alert('알림', 'Apple 로그인은 준비중입니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SNS 계정으로 로그인</Text>
      <View style={styles.buttonContainer}>
        {/* Google 로그인 */}
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGooglePress}
        >
          <Ionicons name="logo-google" size={28} color="#DB4437" />
        </TouchableOpacity>

        {/* 카카오 로그인 */}
        <TouchableOpacity
          style={[styles.button, styles.kakaoButton]}
          onPress={handleKakaoPress}
        >
          <Ionicons name="chatbubble" size={28} color="#000" />
        </TouchableOpacity>

        {/* Apple 로그인 */}
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={handleApplePress}
        >
          <Ionicons name="logo-apple" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
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

export default SocialLoginButtons;
