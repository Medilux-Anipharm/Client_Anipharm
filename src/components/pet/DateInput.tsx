/**
 * DateInput Component
 * 날짜 입력 컴포넌트 (웹/네이티브 통합)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateInputProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'YYYY-MM-DD',
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChange(formattedDate);
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {Platform.OS === 'web' ? (
        /* 웹용 날짜 입력 */
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            height: '52px',
            border: error ? '1.5px solid #FF4444' : '1px solid #E0E0E0',
            borderRadius: '12px',
            padding: '0 16px',
            fontSize: '16px',
            backgroundColor: disabled ? '#F5F5F5' : '#fff',
            color: disabled ? '#999' : '#000',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            boxSizing: 'border-box',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          max={new Date().toISOString().split('T')[0]}
        />
      ) : (
        /* 네이티브용 날짜 입력 */
        <>
          <TouchableOpacity
            style={[styles.dateInput, error ? styles.inputError : null]}
            onPress={openDatePicker}
            disabled={disabled}
          >
            <Text style={[styles.dateText, !value && styles.placeholder]}>
              {value || placeholder}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#999" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
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
  dateInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  placeholder: {
    color: '#999',
  },
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 6,
  },
});

export default DateInput;
