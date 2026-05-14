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
  specializations: string[];

  // Search & Filter State
  searchQuery: string;
  selectedSpecialization: string | null;
  minFee: number | null;
  maxFee: number | null;
  minRating: number | null;
  location: string | null;
  hospital: string | null;
  availability: 'any' | 'today' | 'this-week';
  sortBy: 'fee' | 'fee_desc' | 'rating' | 'rating_desc' | 'distance' | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedSpecialization: (spec: string | null) => void;
  setAdvancedFilters: (filters: Partial<DiscoveryState>) => void;
  fetchDoctors: () => Promise<void>;
  fetchMoreDoctors: () => Promise<void>;
  fetchSpecializations: () => Promise<void>;
  clearFilters: () => void;
  reset: () => void;
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
  minFee: null,
  maxFee: null,
  minRating: null,
  location: null,
  hospital: null,
  availability: 'any',
  sortBy: null,
  specializations: [],

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
      minFee: null,
      maxFee: null,
      minRating: null,
      location: null,
      hospital: null,
      availability: 'any',
      sortBy: null
    });
    get().fetchDoctors();
  },

  fetchSpecializations: async () => {
    try {
      const specs = await doctorApi.getSpecializations();
      set({ specializations: specs });
    } catch (error) {
      console.error('[DiscoveryStore] Error fetching specializations:', error);
    }
  },

  fetchDoctors: async () => {
    set({ isLoading: true, error: null, doctors: [] });
    try {
      const { 
        searchQuery, 
        selectedSpecialization, 
        minFee, 
        maxFee, 
        minRating, 
        location,
        hospital,
        availability,
        sortBy
      } = get();

      const params: ProviderSearchParams = {};
      const trimmedQuery = searchQuery.trim().toLowerCase();
      
      if (trimmedQuery) {
        // General search parameter
        params.q = trimmedQuery;
        
        // Auto-detect specialization from search query
        const specializations = ['general', 'cardiology', 'pediatrics', 'dentistry', 'neurology', 'orthopedics', 'dermatology'];
        const matchedSpec = specializations.find(s => trimmedQuery.includes(s));
        
        if (matchedSpec) {
          params.specialization = matchedSpec.charAt(0).toUpperCase() + matchedSpec.slice(1);
        }

        // If it looks like a hospital search
        if (trimmedQuery.includes('hospital') || trimmedQuery.includes('clinic')) {
          params.current_working_hospital = trimmedQuery;
        }
      }

      // Explicit filters override auto-detection if set
      if (selectedSpecialization) params.specialization = selectedSpecialization;
      if (minFee !== null) params.min_fee = minFee;
      if (maxFee !== null) params.max_fee = maxFee;
      if (minRating !== null) params.min_rating = minRating;
      if (location) params.location = location;
      if (hospital) params.current_working_hospital = hospital;
      if (availability !== 'any') params.availability = availability;
      if (sortBy) params.sort_by = sortBy;

      console.log('[DiscoveryStore] Fetching with params:', params);
      const response = await doctorApi.searchProviders(params);
      console.log('[DiscoveryStore] API Response:', response);
      
      const isPaginated = response && typeof response === 'object' && 'results' in response;
      const results = isPaginated ? response.results : (Array.isArray(response) ? response : []);
      const nextUrl = isPaginated ? response.next : null;
      
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
      console.log('[DiscoveryStore] Load More Response:', response);

      const isPaginated = response && typeof response === 'object' && 'results' in response;
      const results = isPaginated ? response.results : (Array.isArray(response) ? response : []);
      const nextUrl = isPaginated ? response.next : null;
      
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

  reset: () => set({
    doctors: [],
    nextPageUrl: null,
    hasMore: false,
    searchQuery: '',
    selectedSpecialization: null,
    minFee: null,
    maxFee: null,
    minRating: null,
    location: null,
    hospital: null,
    availability: 'any',
    sortBy: null,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    specializations: [],
  }),
}));
