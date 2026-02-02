/**
 * Search and Filter Related Types
 */

export interface SearchFilterState {
  query: string;
  priceRange: [number, number];
  rating: number | null;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
  category: string | null;
}

export interface FilterOptions {
  page?: number;
  limit?: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  category?: string;
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

export interface SearchResult {
  data: any[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
