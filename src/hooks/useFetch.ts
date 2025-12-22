/**
 * useFetch Hook
 * API 데이터를 가져오는 커스텀 훅
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

interface UseFetchOptions {
  immediate?: boolean; // 즉시 실행 여부
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useFetch = <T = any>(
  url: string,
  options: UseFetchOptions = { immediate: true }
): UseFetchReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는데 실패했습니다');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
