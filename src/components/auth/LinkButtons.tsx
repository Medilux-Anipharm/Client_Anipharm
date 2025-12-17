/**
 * LinkButtons Component
 * 링크 버튼들 컴포넌트 (아이디/비밀번호 찾기, 회원가입)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface LinkButtonsProps {
  onFindIdPress?: () => void;
  onFindPasswordPress?: () => void;
  onSignUpPress?: () => void;
}

const LinkButtons: React.FC<LinkButtonsProps> = ({
  onFindIdPress,
  onFindPasswordPress,
  onSignUpPress,
}) => {
  return (
    <View style={styles.container}>
      {onFindIdPress && (
        <>
          <TouchableOpacity onPress={onFindIdPress}>
            <Text style={styles.linkText}>아이디 찾기</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
        </>
      )}
      {onFindPasswordPress && (
        <>
          <TouchableOpacity onPress={onFindPasswordPress}>
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
        </>
      )}
      {onSignUpPress && (
        <TouchableOpacity onPress={onSignUpPress}>
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default LinkButtons;
