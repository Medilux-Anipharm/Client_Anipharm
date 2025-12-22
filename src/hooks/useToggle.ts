/**
 * useToggle Hook
 * Boolean 값을 토글하는 커스텀 훅
 */

import { useState, useCallback } from 'react';

type UseToggleReturn = [boolean, () => void, (value: boolean) => void];

const useToggle = (initialValue: boolean = false): UseToggleReturn => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setValueDirectly = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, setValueDirectly];
};

export default useToggle;
