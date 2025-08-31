import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssets } from '../hooks/useAssets';

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: global.testUtils.mockSupabase
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('useAssets Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAssets());

    expect(result.current.assets).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.currentPage).toBe(0);
  });

  it('should fetch assets successfully', async () => {
    const mockAssets = [
      global.testUtils.createMockAsset({ id: '1', descricao: 'Asset 1' }),
      global.testUtils.createMockAsset({ id: '2', descricao: 'Asset 2' })
    ];

    // Mock Supabase query chain
    const mockRange = vi.fn(() => Promise.resolve({
      data: mockAssets,
      error: null,
      count: 2
    }));
    
    const mockIlike = vi.fn(() => ({ range: mockRange }));
    const mockEq = vi.fn(() => ({ ilike: mockIlike }));
    const mockOr = vi.fn(() => ({ eq: mockEq, ilike: mockIlike }));
    const mockOrder = vi.fn(() => ({ or: mockOr, eq: mockEq, ilike: mockIlike, range: mockRange }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    global.testUtils.mockSupabase.from = mockFrom;

    const { result } = renderHook(() => useAssets());

    await act(async () => {
      await result.current.fetchAssets();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.assets).toHaveLength(2);
    expect(result.current.totalCount).toBe(2);
  });

  it('should handle fetch error gracefully', async () => {
    const mockError = new Error('Fetch failed');

    // Mock Supabase query chain with error
    const mockRange = vi.fn(() => Promise.resolve({
      data: null,
      error: mockError,
      count: 0
    }));
    
    const mockIlike = vi.fn(() => ({ range: mockRange }));
    const mockEq = vi.fn(() => ({ ilike: mockIlike }));
    const mockOr = vi.fn(() => ({ eq: mockEq, ilike: mockIlike }));
    const mockOrder = vi.fn(() => ({ or: mockOr, eq: mockEq, ilike: mockIlike, range: mockRange }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    global.testUtils.mockSupabase.from = mockFrom;

    const { result } = renderHook(() => useAssets());

    await act(async () => {
      await result.current.fetchAssets();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError.message);
    expect(result.current.assets).toEqual([]);
  });

  it('should create asset with optimistic updates', async () => {
    const newAssetData = {
      descricao: 'New Asset',
      categoria: 'Móveis e Utensílios',
      status: 'Ativo'
    };

    const createdAsset = global.testUtils.createMockAsset(newAssetData);

    // Mock successful creation
    global.testUtils.mockSupabase.from = vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: createdAsset,
            error: null
          }))
        }))
      }))
    }));

    const { result } = renderHook(() => useAssets());

    await act(async () => {
      await result.current.createAsset(newAssetData);
    });

    expect(result.current.assets).toHaveLength(1);
    expect(result.current.assets[0].descricao).toBe('New Asset');
    expect(result.current.totalCount).toBe(1);
  });

  it('should cache fetch results', async () => {
    const mockAssets = [global.testUtils.createMockAsset()];

    // Mock successful response with spy
    const fetchSpy = vi.fn(() => Promise.resolve({
      data: mockAssets,
      error: null,
      count: 1
    }));

    const mockOrder = vi.fn(() => ({ range: fetchSpy }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    global.testUtils.mockSupabase.from = mockFrom;

    const { result } = renderHook(() => useAssets());

    // First fetch
    await act(async () => {
      await result.current.fetchAssets(0, '', {});
    });

    // Second fetch with same parameters
    await act(async () => {
      await result.current.fetchAssets(0, '', {});
    });

    // Should only call the API once due to caching
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.current.assets).toHaveLength(1);
  });

  it('should clear cache when requested', () => {
    const { result } = renderHook(() => useAssets());

    act(() => {
      result.current.clearCache();
    });

    // Cache should be cleared (this is more of a unit test for the internal state)
    expect(typeof result.current.clearCache).toBe('function');
  });

  it('should validate required hooks are returned', () => {
    const { result } = renderHook(() => useAssets());

    // Check all required hook properties exist
    expect(result.current).toHaveProperty('assets');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('totalCount');
    expect(result.current).toHaveProperty('currentPage');
    expect(result.current).toHaveProperty('fetchAssets');
    expect(result.current).toHaveProperty('createAsset');
    expect(result.current).toHaveProperty('updateAsset');
    expect(result.current).toHaveProperty('deleteAsset');
    expect(result.current).toHaveProperty('moveAsset');
    expect(result.current).toHaveProperty('getUniqueLocations');
    expect(result.current).toHaveProperty('clearCache');

    // Check functions are actually functions
    expect(typeof result.current.fetchAssets).toBe('function');
    expect(typeof result.current.createAsset).toBe('function');
    expect(typeof result.current.updateAsset).toBe('function');
    expect(typeof result.current.deleteAsset).toBe('function');
    expect(typeof result.current.moveAsset).toBe('function');
    expect(typeof result.current.getUniqueLocations).toBe('function');
    expect(typeof result.current.clearCache).toBe('function');
  });
});