/**
 * CommentInput Component
 * 댓글 입력 컴포넌트
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = '댓글을 입력해주세요.',
  disabled = false,
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim() || disabled) return;

    onSubmit(content.trim());
    setContent('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        maxLength={200}
        editable={!disabled}
      />
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!content.trim() || disabled) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!content.trim() || disabled}
        activeOpacity={0.7}
      >
        <Ionicons
          name="send"
          size={20}
          color={!content.trim() || disabled ? '#CCC' : '#FF8A3D'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
    marginRight: 8,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});

export default CommentInput;
