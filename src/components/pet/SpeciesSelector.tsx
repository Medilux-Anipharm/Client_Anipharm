/**
 * SpeciesSelector Component
 * 반려동물 종 선택 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { PetSpecies } from '../../types/pet';

interface SpeciesSelectorProps {
  label?: string;
  value: PetSpecies | '';
  onChange: (species: PetSpecies) => void;
  disabled?: boolean;
}

const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({
  label,
  value,
  onChange,
  disabled = false,
}) => {
  const options: PetSpecies[] = ['강아지', '고양이'];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.buttonContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.button,
              value === option && styles.buttonActive,
            ]}
            onPress={() => onChange(option)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.buttonText,
                value === option && styles.buttonTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonActive: {
    borderColor: '#FF8A3D',
    borderWidth: 2,
    backgroundColor: '#FFF5EF',
  },
  buttonText: {
    fontSize: 16,
    color: '#666',
  },
  buttonTextActive: {
    fontSize: 16,
    color: '#FF8A3D',
    fontWeight: '600',
  },
});

export default SpeciesSelector;
