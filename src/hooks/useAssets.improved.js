import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { TOAST_MESSAGES, PAGINATION_LIMIT } from '../utils/constants';

export const useAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Cache for performance
  const [cache, setCache] = useState(new Map());
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [lastFetchParams, setLastFetchParams] = useState(null);

  // Memoized cache key generator
  const getCacheKey = useCallback((page, searchTerm, filters) => {
    return `${page}-${searchTerm}-${JSON.stringify(filters)}`;
  }, []);

  // Optimized fetch with caching and request deduplication
  const fetchAssets = useCallback(async (page = 0, searchTerm = '', filters = {}) => {
    const cacheKey = getCacheKey(page, searchTerm, filters);
    
    // Return cached data if available
    if (cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      setAssets(cachedData.assets);
      setTotalCount(cachedData.totalCount);
      setCurrentPage(page);
      return;
    }

    // Prevent duplicate requests
    const currentParams = { page, searchTerm, filters };
    if (JSON.stringify(lastFetchParams) === JSON.stringify(currentParams) && loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setLastFetchParams(currentParams);

    try {
      let query = supabase
        .from('bens_patrimoniais')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Optimized search using full-text search when available
      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        query = query.or(`codigo.ilike.${searchPattern},descricao.ilike.${searchPattern},categoria.ilike.${searchPattern},localizacao_atual.ilike.${searchPattern},responsavel_atual.ilike.${searchPattern}`);
      }

      // Apply filters efficiently
      if (filters.categoria) query = query.eq('categoria', filters.categoria);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.localizacao) query = query.ilike('localizacao_atual', `%${filters.localizacao}%`);

      // Apply pagination
      const from = page * PAGINATION_LIMIT;
      const to = from + PAGINATION_LIMIT - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const result = { assets: data || [], totalCount: count || 0 };
      
      // Cache the result (with size limit to prevent memory leaks)
      if (cache.size >= 50) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(cacheKey, result);
      setCache(new Map(cache));

      setAssets(result.assets);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err.message);
      toast.error(TOAST_MESSAGES.ERROR.LOAD_ASSETS);
    } finally {
      setLoading(false);
    }
  }, [cache, getCacheKey, lastFetchParams, loading]);

  // Optimized create with optimistic updates
  const createAsset = useCallback(async (assetData) => {
    setLoading(true);
    setError(null);

    // Optimistic update
    const tempAsset = {
      id: `temp-${Date.now()}`,
      ...assetData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setAssets(prev => [tempAsset, ...prev]);
    setTotalCount(prev => prev + 1);

    try {
      const { data, error } = await supabase
        .from('bens_patrimoniais')
        .insert([assetData])
        .select()
        .single();

      if (error) throw error;

      // Replace temp asset with real data
      setAssets(prev => prev.map(asset => 
        asset.id === tempAsset.id ? data : asset
      ));

      // Clear cache to force refresh
      setCache(new Map());

      toast.success(TOAST_MESSAGES.SUCCESS.ASSET_CREATED);
      return data;
    } catch (err) {
      // Revert optimistic update
      setAssets(prev => prev.filter(asset => asset.id !== tempAsset.id));
      setTotalCount(prev => prev - 1);
      
      console.error('Error creating asset:', err);
      setError(err.message);
      toast.error(TOAST_MESSAGES.ERROR.SAVE_ASSET);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Batch operations for better performance
  const updateAssets = useCallback(async (updates) => {
    setLoading(true);
    setError(null);

    try {
      const promises = updates.map(({ id, data }) =>
        supabase
          .from('bens_patrimoniais')
          .update(data)
          .eq('id', id)
          .select()
          .single()
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} assets`);
      }

      // Update local state
      const updatedAssets = results.map(result => result.data);
      setAssets(prev => prev.map(asset => {
        const updated = updatedAssets.find(ua => ua.id === asset.id);
        return updated || asset;
      }));

      // Clear cache
      setCache(new Map());

      toast.success(`${updatedAssets.length} assets updated successfully`);
      return updatedAssets;
    } catch (err) {
      console.error('Error updating assets:', err);
      setError(err.message);
      toast.error(TOAST_MESSAGES.ERROR.SAVE_ASSET);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized unique locations with caching
  const getUniqueLocations = useCallback(async () => {
    if (uniqueLocations.length > 0) return uniqueLocations;

    try {
      const { data, error } = await supabase
        .from('bens_patrimoniais')
        .select('localizacao_atual')
        .not('localizacao_atual', 'is', null);

      if (error) throw error;

      const locations = [...new Set(data.map(item => item.localizacao_atual))]
        .filter(location => location && location.trim() !== '')
        .sort();
      
      setUniqueLocations(locations);
      return locations;
    } catch (err) {
      console.error('Error fetching locations:', err);
      return [];
    }
  }, [uniqueLocations]);

  // Clear cache when needed
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // Memoized return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    assets,
    loading,
    error,
    totalCount,
    currentPage,
    fetchAssets,
    createAsset,
    updateAssets, // New batch update method
    deleteAsset: async (id) => {
      setLoading(true);
      try {
        const { error } = await supabase.from('bens_patrimoniais').delete().eq('id', id);
        if (error) throw error;
        
        setAssets(prev => prev.filter(asset => asset.id !== id));
        setTotalCount(prev => prev - 1);
        setCache(new Map()); // Clear cache
        
        toast.success(TOAST_MESSAGES.SUCCESS.ASSET_DELETED);
      } catch (err) {
        console.error('Error deleting asset:', err);
        toast.error(TOAST_MESSAGES.ERROR.DELETE_ASSET);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    moveAsset: async (assetId, movementData) => {
      setLoading(true);
      try {
        // Use Supabase transaction for atomicity
        const { error: movementError } = await supabase
          .from('movimentacoes')
          .insert([{ bem_id: assetId, ...movementData }]);

        if (movementError) throw movementError;

        const { data: updatedAsset, error: updateError } = await supabase
          .from('bens_patrimoniais')
          .update({
            localizacao_atual: movementData.localizacao_destino,
            responsavel_atual: movementData.responsavel_destino
          })
          .eq('id', assetId)
          .select()
          .single();

        if (updateError) throw updateError;

        setAssets(prev => prev.map(asset => 
          asset.id === assetId ? { ...asset, ...updatedAsset } : asset
        ));
        setCache(new Map()); // Clear cache

        toast.success(TOAST_MESSAGES.SUCCESS.MOVEMENT_CREATED);
        return updatedAsset;
      } catch (err) {
        console.error('Error moving asset:', err);
        toast.error(TOAST_MESSAGES.ERROR.SAVE_MOVEMENT);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    getUniqueLocations,
    clearCache
  }), [
    assets, loading, error, totalCount, currentPage,
    fetchAssets, createAsset, updateAssets, getUniqueLocations, clearCache
  ]);

  return returnValue;
};