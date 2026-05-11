import { create } from 'zustand';
import { doctorApi } from '../features/doctor/services/doctor.api';
import type { ProviderSearchParams, ProviderSearchResult } from '../features/doctor/types/doctor.types';

interface DiscoveryState {
  doctors: ProviderSearchResult[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  nextPageUrl: string | null;

  // Search & Filter State
  searchQuery: string;
  selectedSpecialization: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  availability: 'any' | 'today' | 'this-week';

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedSpecialization: (spec: string | null) => void;
  setAdvancedFilters: (filters: Partial<DiscoveryState>) => void;
  fetchDoctors: () => Promise<void>;
  fetchMoreDoctors: () => Promise<void>;
  clearFilters: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  doctors: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: false,
  nextPageUrl: null,
  searchQuery: '',
  selectedSpecialization: null,
  minPrice: null,
  maxPrice: null,
  minRating: null,
  availability: 'any',

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().fetchDoctors();
  },

  setSelectedSpecialization: (selectedSpecialization) => {
    set({ selectedSpecialization });
    get().fetchDoctors();
  },

  setAdvancedFilters: (filters) => {
    set({ ...filters });
    get().fetchDoctors();
  },

  clearFilters: () => {
    set({ 
      searchQuery: '', 
      selectedSpecialization: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      availability: 'any'
    });
    get().fetchDoctors();
  },

  fetchDoctors: async () => {
    set({ isLoading: true, error: null, doctors: [] });
    try {
      const { 
        searchQuery, 
        selectedSpecialization, 
        minPrice, 
        maxPrice, 
        minRating, 
        availability 
      } = get();

      const params: ProviderSearchParams = {};
      if (searchQuery.trim()) {
        params.search = searchQuery;
        (params as any).q = searchQuery;
        (params as any).query = searchQuery;
      }
      if (selectedSpecialization) params.specialization = selectedSpecialization;
      if (minPrice !== null) params.min_price = minPrice;
      if (maxPrice !== null) params.max_price = maxPrice;
      if (minRating !== null) params.min_rating = minRating;
      if (availability !== 'any') params.availability = availability;

      console.log('[DiscoveryStore] Fetching with params:', params);
      const response = await doctorApi.searchProviders(params);
      
      const isPaginated = response && typeof response === 'object' && 'results' in response;
      const results = isPaginated ? response.results : (Array.isArray(response) ? response : []);
      const nextUrl = isPaginated ? response.next : null;
      
      // Explicit debug logs as requested
      console.log('--- DOCTORS FETCH DEBUG ---');
      console.log('Doctors response:', response);
      console.log('Doctors data:', results);
      console.log('Doctors count:', results?.length);
      console.log('Selected category:', selectedSpecialization);
      console.log('---------------------------');
      
      set({ 
        doctors: results, 
        nextPageUrl: nextUrl,
        hasMore: !!nextUrl,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('[DiscoveryStore] Fetch Error:', error);
      set({
        error: error.response?.data?.detail || 'Failed to fetch doctors',
        isLoading: false
      });
    }
  },

  fetchMoreDoctors: async () => {
    const { nextPageUrl, isLoadingMore, hasMore } = get();
    if (!hasMore || !nextPageUrl || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      console.log('[DiscoveryStore] Loading more from:', nextPageUrl);
      const response = await doctorApi.fetchNextPage(nextPageUrl);

      const isPaginated = response && typeof response === 'object' && 'results' in response;
      const results = isPaginated ? response.results : (Array.isArray(response) ? response : []);
      const nextUrl = isPaginated ? response.next : null;
      
      // Explicit debug logs as requested
      console.log('--- DOCTORS LOAD MORE DEBUG ---');
      console.log('Doctors response:', response);
      console.log('Doctors data:', results);
      console.log('Doctors count:', results?.length);
      console.log('Selected category:', get().selectedSpecialization);
      console.log('-------------------------------');
      
      set((state) => ({ 
        doctors: [...state.doctors, ...results], 
        nextPageUrl: nextUrl,
        hasMore: !!nextUrl,
        isLoadingMore: false 
      }));
    } catch (error: any) {
      console.error('[DiscoveryStore] Load More Error:', error);
      set({ 
        isLoadingMore: false,
        error: 'Failed to load more doctors' 
      });
    }
  },
}));
