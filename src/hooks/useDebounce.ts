/**
 * useDebounce Hook
 * 값의 변경을 지연시켜 불필요한 호출을 방지하는 커스텀 훅
 */

import { useState, useEffect } from 'react';

const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
