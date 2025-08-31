import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '../utils/constants';

export const useMovements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch movements for a specific asset
  const fetchAssetMovements = async (assetId) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .select(`
          *,
          bens_patrimoniais (
            codigo,
            descricao
          )
        `)
        .eq('bem_id', assetId)
        .order('data_movimentacao', { ascending: false });

      if (error) throw error;

      setMovements(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching movements:', err);
      setError(err.message);
      toast.error(TOAST_MESSAGES.ERROR.LOAD_MOVEMENTS);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all movements (for reports)
  const fetchAllMovements = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .select(`
          *,
          bens_patrimoniais (
            codigo,
            descricao
          )
        `)
        .order('data_movimentacao', { ascending: false });

      if (error) throw error;

      // Flatten the data for easier use in reports
      const flattenedData = data?.map(movement => ({
        ...movement,
        bem_codigo: movement.bens_patrimoniais?.codigo,
        bem_descricao: movement.bens_patrimoniais?.descricao
      })) || [];

      setMovements(flattenedData);
      return flattenedData;
    } catch (err) {
      console.error('Error fetching all movements:', err);
      setError(err.message);
      toast.error(TOAST_MESSAGES.ERROR.LOAD_MOVEMENTS);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    movements,
    loading,
    error,
    fetchAssetMovements,
    fetchAllMovements
  };
};