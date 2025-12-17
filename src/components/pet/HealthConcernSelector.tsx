/**
 * HealthConcernSelector Component
 * 건강 고민 선택 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { HealthConcern, HEALTH_CONCERN_LABELS } from '../../types/pet';

interface HealthConcernSelectorProps {
  label?: string;
  values: HealthConcern[];
  onChange: (concerns: HealthConcern[]) => void;
  maxSelection?: number;
  disabled?: boolean;
}

const HealthConcernSelector: React.FC<HealthConcernSelectorProps> = ({
  label,
  values,
  onChange,
  maxSelection = 5,
  disabled = false,
}) => {
  const options: HealthConcern[] = [
    'dental',
    'joint',
    'skin',
    'eye',
    'kidney',
    'vomit',
    'aging',
    'nutrition',
    'heart',
    'obesity',
    'constipation',
    'immunity',
  ];

  const toggleConcern = (concern: HealthConcern) => {
    if (values.includes(concern)) {
      onChange(values.filter((c) => c !== concern));
    } else {
      if (values.length >= maxSelection) {
        Alert.alert('알림', `건강 고민은 최대 ${maxSelection}개까지 선택 가능합니다.`);
        return;
      }
      onChange([...values, concern]);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.chipContainer}>
        {options.map((concern) => (
          <TouchableOpacity
            key={concern}
            style={[
              styles.chip,
              values.includes(concern) && styles.chipActive,
            ]}
            onPress={() => toggleConcern(concern)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.chipText,
                values.includes(concern) && styles.chipTextActive,
              ]}
            >
              {HEALTH_CONCERN_LABELS[concern]}
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  chipActive: {
    borderColor: '#FF8A3D',
    borderWidth: 1.5,
    backgroundColor: '#FFF5EF',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextActive: {
    fontSize: 14,
    color: '#FF8A3D',
    fontWeight: '500',
  },
});

export default HealthConcernSelector;
