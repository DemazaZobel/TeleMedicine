// src/__tests__/unit/stores/discoveryStore.test.ts
// Tests: TC-SEARCH-001, TC-SEARCH-002, TC-SEARCH-003, TC-SEARCH-006
// Run: npx jest src/__tests__/unit/stores/discoveryStore.test.ts

import { act } from 'react-test-renderer';
import { useDiscoveryStore } from '../../../store/discovery.store';
import { doctorApi } from '../../../features/doctor/services/doctor.api';

jest.mock('../../../features/doctor/services/doctor.api');
const mockedDoctorApi = doctorApi as jest.Mocked<typeof doctorApi>;

// ─── Fixtures ────────────────────────────────────────────────────────────────
const makeDoctorResult = (overrides = {}) => ({
  id: 'doc-1',
  user: { id: 'u1', first_name: 'Abebe', last_name: 'Girma', email: 'd@test.com' },
  specialization: 'Cardiologist',
  experience_years: 10,
  consultation_fee: '500.00',
  average_rating: 4.5,
  hospital: 'Black Lion',
  location: 'Addis Ababa',
  ...overrides,
});

beforeEach(() => {
  useDiscoveryStore.setState({
    doctors: [],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: false,
    nextPageUrl: null,
    specializations: [],
    searchQuery: '',
    selectedSpecialization: null,
    minFee: null,
    maxFee: null,
    minRating: null,
    location: null,
    hospital: null,
    availability: 'any',
    sortBy: null,
  });
  jest.clearAllMocks();
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-SEARCH-001 — Search by Specialization
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-SEARCH-001: search doctors by specialization', () => {
  it('calls search API with query and populates doctors', async () => {
    const doctor = makeDoctorResult({ specialization: 'Cardiologist' });
    mockedDoctorApi.searchProviders.mockResolvedValueOnce({
      results: [doctor],
      count: 1,
      next: null,
      previous: null,
    } as any);

    await act(async () => {
      useDiscoveryStore.setState({ searchQuery: 'Cardiologist' });
      await useDiscoveryStore.getState().fetchDoctors();
    });

    const state = useDiscoveryStore.getState();
    expect(mockedDoctorApi.searchProviders).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'cardiologist' })
    );
    expect(state.doctors).toHaveLength(1);
    expect(state.doctors[0].specialization).toBe('Cardiologist');
    expect(state.isLoading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-SEARCH-002 — Filter by Fee Range
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-SEARCH-002: filter by fee range', () => {
  it('sends min_fee and max_fee params to API', async () => {
    mockedDoctorApi.searchProviders.mockResolvedValueOnce({
      results: [makeDoctorResult({ consultation_fee: '500.00' })],
      count: 1,
      next: null,
      previous: null,
    } as any);

    await act(async () => {
      useDiscoveryStore.setState({ minFee: 200, maxFee: 800 });
      await useDiscoveryStore.getState().fetchDoctors();
    });

    expect(mockedDoctorApi.searchProviders).toHaveBeenCalledWith(
      expect.objectContaining({ min_fee: 200, max_fee: 800 })
    );
    expect(useDiscoveryStore.getState().doctors).toHaveLength(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-SEARCH-003 — Filter by Rating
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-SEARCH-003: filter by minimum rating', () => {
  it('sends min_rating param to API', async () => {
    mockedDoctorApi.searchProviders.mockResolvedValueOnce({
      results: [makeDoctorResult({ average_rating: 4.5 })],
      count: 1,
      next: null,
      previous: null,
    } as any);

    await act(async () => {
      useDiscoveryStore.setState({ minRating: 4 });
      await useDiscoveryStore.getState().fetchDoctors();
    });

    expect(mockedDoctorApi.searchProviders).toHaveBeenCalledWith(
      expect.objectContaining({ min_rating: 4 })
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC-SEARCH-006 — No Results State
// ═════════════════════════════════════════════════════════════════════════════
describe('TC-SEARCH-006: no results', () => {
  it('sets empty doctors array without error when no results found', async () => {
    mockedDoctorApi.searchProviders.mockResolvedValueOnce({
      results: [],
      count: 0,
      next: null,
      previous: null,
    } as any);

    await act(async () => {
      useDiscoveryStore.setState({ searchQuery: 'Xenobiologist' });
      await useDiscoveryStore.getState().fetchDoctors();
    });

    const state = useDiscoveryStore.getState();
    expect(state.doctors).toHaveLength(0);
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Clear Filters
// ═════════════════════════════════════════════════════════════════════════════
describe('clearFilters', () => {
  it('resets all filter state and triggers a new fetch', async () => {
    useDiscoveryStore.setState({
      minFee: 200,
      maxFee: 800,
      minRating: 4,
      searchQuery: 'Cardiologist',
      selectedSpecialization: 'Cardiology',
    });

    mockedDoctorApi.searchProviders.mockResolvedValueOnce({
      results: [],
      count: 0,
      next: null,
      previous: null,
    } as any);

    await act(async () => {
      useDiscoveryStore.getState().clearFilters();
    });

    const state = useDiscoveryStore.getState();
    expect(state.minFee).toBeNull();
    expect(state.maxFee).toBeNull();
    expect(state.minRating).toBeNull();
    expect(state.searchQuery).toBe('');
    expect(state.selectedSpecialization).toBeNull();
  });
});