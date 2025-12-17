/**
 * AuthTitle Component
 * 인증 화면 타이틀 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface AuthTitleProps {
  subtitle?: string;
}

const AuthTitle: React.FC<AuthTitleProps> = ({ subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.titleOrange}>Anipharm</Text>
        <Text style={styles.titleBlack}>에</Text>
      </Text>
      <Text style={styles.subtitle}>
        {subtitle || '오신 것을 환영해요!'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default AuthTitle;
