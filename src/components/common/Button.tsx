/**
 * Button Component
 * 공통 버튼 컴포넌트
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'large',
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`${variant}Button`],
        styles[`${size}Button`],
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#FF8A3D' : '#fff'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            styles[`${variant}ButtonText`],
            styles[`${size}ButtonText`],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Variant styles
  primaryButton: {
    backgroundColor: '#FF8A3D',
  },
  secondaryButton: {
    backgroundColor: '#FFF5EF',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF8A3D',
  },
  // Size styles
  smallButton: {
    height: 40,
    paddingHorizontal: 16,
  },
  mediumButton: {
    height: 48,
    paddingHorizontal: 20,
  },
  largeButton: {
    height: 56,
    paddingHorizontal: 24,
  },
  // Disabled style
  disabledButton: {
    backgroundColor: '#FFD4B8',
    opacity: 0.6,
  },
  // Text styles
  buttonText: {
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#FF8A3D',
    fontSize: 16,
  },
  outlineButtonText: {
    color: '#FF8A3D',
    fontSize: 16,
  },
  smallButtonText: {
    fontSize: 14,
  },
  mediumButtonText: {
    fontSize: 15,
  },
  largeButtonText: {
    fontSize: 16,
  },
});

export default Button;
