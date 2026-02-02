import { useState, useCallback } from 'react';
import * as api from '@/services/api';
import { SearchFilterState } from '@/types/search';

interface UseSearchResult {
  results: any[];
  loading: boolean;
  error: string | null;
  search: (filters: SearchFilterState) => Promise<void>;
  reset: () => void;
}

/**
 * Hook để xử lý tìm kiếm và lọc sản phẩm
 * @returns Object chứa results, loading, error, và hàm search
 */
export const useProductSearch = (): UseSearchResult => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (filters: SearchFilterState) => {
    try {
      setLoading(true);
      setError(null);

      // Nếu có từ khóa hoặc bộ lọc, gọi API tìm kiếm nâng cao
      if (filters.query || filters.category || filters.rating) {
        const response = await api.searchProductsAdvanced(filters.query, {
          priceMin: filters.priceRange[0],
          priceMax: filters.priceRange[1],
          rating: filters.rating || undefined,
          category: filters.category || undefined,
          sortBy: filters.sortBy,
        });

        if (response && response.data) {
          setResults(response.data);
        }
      } else {
        // Nếu không có tìm kiếm, gọi filter endpoint
        const response = await api.filterProducts({
          priceMin: filters.priceRange[0],
          priceMax: filters.priceRange[1],
          rating: filters.rating || undefined,
          categoryId: filters.category || undefined,
          sortBy: filters.sortBy !== 'relevance' ? filters.sortBy : undefined,
        });

        if (response && response.data) {
          setResults(response.data);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi tìm kiếm';
      setError(message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, reset };
};

/**
 * Hook để debounce tìm kiếm (tránh quá nhiều API call)
 * @param callback Hàm callback khi debounce hoàn thành
 * @param delay Độ trễ (ms, mặc định: 500ms)
 * @returns Hàm debouncedSearch
 */
export const useDebouncedSearch = (
  callback: (query: string) => void,
  delay: number = 500
) => {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback(
    (query: string) => {
      // Xóa timeout trước đó
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Đặt timeout mới
      const newTimeoutId = setTimeout(() => {
        callback(query);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  );

  return debouncedSearch;
};
