/**
 * useForm Hook
 * 폼 상태 관리 및 유효성 검사를 위한 커스텀 훅
 */

import { useState } from 'react';

interface ValidationRules<T> {
  [K in keyof T]?: (value: T[K]) => string | undefined;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  handleChange: (name: keyof T, value: any) => void;
  handleSubmit: (onSubmit: (values: T) => void) => void;
  resetForm: () => void;
  setFieldError: (name: keyof T, error: string) => void;
}

const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // 실시간 유효성 검사
    if (validationRules?.[name]) {
      const error = validationRules[name]!(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validate = (): boolean => {
    if (!validationRules) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const rule = validationRules[key as keyof T];
      if (rule) {
        const error = rule(values[key as keyof T]);
        if (error) {
          newErrors[key as keyof T] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (onSubmit: (values: T) => void) => {
    if (validate()) {
      onSubmit(values);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  const setFieldError = (name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldError,
  };
};

export default useForm;
