import { create } from 'zustand';
import { doctorApi } from '../features/doctor/services/doctor.api';
import type { ProviderSearchResult, ProviderSearchParams } from '../features/doctor/types/doctor.types';

interface DiscoveryState {
  doctors: ProviderSearchResult[];
  isLoading: boolean;
  error: string | null;

  // Search & Filter State
  searchQuery: string;
  selectedSpecialization: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedSpecialization: (spec: string | null) => void;
  fetchDoctors: () => Promise<void>;
  clearFilters: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  doctors: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedSpecialization: null,

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().fetchDoctors();
  },

  setSelectedSpecialization: (selectedSpecialization) => {
    set({ selectedSpecialization });
    get().fetchDoctors();
  },

  clearFilters: () => {
    set({ searchQuery: '', selectedSpecialization: null });
    get().fetchDoctors();
  },

  fetchDoctors: async () => {
    set({ isLoading: true, error: null });
    try {
      const { searchQuery, selectedSpecialization } = get();
      
      const params: ProviderSearchParams = {};
      if (searchQuery.trim()) {
        params.query = searchQuery;
      }
      if (selectedSpecialization) {
        params.specialization = selectedSpecialization;
      }

      const results = await doctorApi.searchProviders(params);
      set({ doctors: results, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch doctors', 
        isLoading: false 
      });
    }
  },
}));
