/**
 * ImagePicker Component
 * 이미지 선택 컴포넌트
 */

import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerProps {
  imageUri: string | null;
  onPress: () => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ imageUri, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.defaultContainer}>
          <Ionicons name="paw" size={40} color="#999" />
        </View>
      )}
      <View style={styles.cameraIconContainer}>
        <Ionicons name="camera" size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    position: 'relative',
  },
  defaultContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF8A3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImagePicker;
