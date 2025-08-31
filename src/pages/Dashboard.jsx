import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Edit, ArrowRightLeft, History, Trash2, Package, DollarSign, TrendingUp, Calculator, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useAssets } from '../hooks/useAssets';
import { formatCurrency, formatDate, getStatusColorClass, debounce } from '../utils/helpers';
import { ASSET_TYPES, ASSET_STATUSES, SEARCH_PLACEHOLDER } from '../utils/constants';
import { exportToExcel, exportToJSON, exportFilteredToExcel, exportFilteredToJSON } from '../utils/exportUtils';
import AssetForm from '../components/AssetForm';
import MovementModal from '../components/MovementModal';
import MovementHistoryModal from '../components/MovementHistoryModal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import WelcomeScreen from '../components/WelcomeScreen';

const Dashboard = () => {
  const {
    assets,
    loading,
    error,
    totalCount,
    currentPage,
    fetchAssets,
    deleteAsset,
    getUniqueLocations
  } = useAssets();

  // State for UI
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showCostDetails, setShowCostDetails] = useState(false);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: '',
    status: '',
    localizacao: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueLocations, setUniqueLocations] = useState([]);

  // Debounced search
  const debouncedSearch = debounce((term, currentFilters, page) => {
    fetchAssets(page, term, currentFilters);
  }, 500);

  // Load data on component mount
  useEffect(() => {
    fetchAssets();
    loadUniqueLocations();
  }, []);

  // Handle search term changes
  useEffect(() => {
    debouncedSearch(searchTerm, filters, 0);
  }, [searchTerm]);

  const loadUniqueLocations = async () => {
    const locations = await getUniqueLocations();
    setUniqueLocations(locations);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    fetchAssets(0, searchTerm, newFilters);
  };

  const clearFilters = () => {
    setFilters({ tipo: '', status: '', localizacao: '' });
    fetchAssets(0, searchTerm, { tipo: '', status: '', localizacao: '' });
  };

  const handlePageChange = (page) => {
    fetchAssets(page, searchTerm, filters);
  };

  const handleCreateAsset = () => {
    setEditingAsset(null);
    setShowAssetForm(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleMoveAsset = (asset) => {
    setSelectedAsset(asset);
    setShowMovementModal(true);
  };

  const handleViewHistory = (asset) => {
    setSelectedAsset(asset);
    setShowHistoryModal(true);
  };

  const handleDeleteAsset = (asset) => {
    setSelectedAsset(asset);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (selectedAsset) {
      await deleteAsset(selectedAsset.id);
      setShowConfirmModal(false);
      setSelectedAsset(null);
      // Refresh the list
      fetchAssets(currentPage, searchTerm, filters);
    }
  };

  const onAssetSaved = () => {
    setShowAssetForm(false);
    setEditingAsset(null);
    // Refresh the list
    fetchAssets(currentPage, searchTerm, filters);
  };

  const onMovementSaved = () => {
    setShowMovementModal(false);
    setSelectedAsset(null);
    // Refresh the list
    fetchAssets(currentPage, searchTerm, filters);
  };

  const hasActiveFilters = filters.tipo || filters.status || filters.localizacao;

  // Calculate cost statistics
  const costStats = useMemo(() => {
    if (!assets || assets.length === 0) {
      return {
        totalValue: 0,
        totalItems: 0,
        averageValue: 0,
        categoryStats: {},
        statusStats: {}
      };
    }

    const totalValue = assets.reduce((sum, asset) => {
      const value = parseFloat(asset.valor_aquisicao) || 0;
      const quantity = parseInt(asset.quantidade) || 1;
      return sum + (value * quantity);
    }, 0);

    const totalItems = assets.reduce((sum, asset) => {
      return sum + (parseInt(asset.quantidade) || 1);
    }, 0);

    const averageValue = totalItems > 0 ? totalValue / totalItems : 0;

    // Group by category (tipo)
    const categoryStats = assets.reduce((acc, asset) => {
      const category = asset.tipo || 'Sem categoria';
      const value = parseFloat(asset.valor_aquisicao) || 0;
      const quantity = parseInt(asset.quantidade) || 1;
      const totalItemValue = value * quantity;

      if (!acc[category]) {
        acc[category] = { value: 0, items: 0, count: 0 };
      }
      acc[category].value += totalItemValue;
      acc[category].items += quantity;
      acc[category].count += 1;
      return acc;
    }, {});

    // Group by status
    const statusStats = assets.reduce((acc, asset) => {
      const status = asset.status || 'Sem status';
      const value = parseFloat(asset.valor_aquisicao) || 0;
      const quantity = parseInt(asset.quantidade) || 1;
      const totalItemValue = value * quantity;

      if (!acc[status]) {
        acc[status] = { value: 0, items: 0, count: 0 };
      }
      acc[status].value += totalItemValue;
      acc[status].items += quantity;
      acc[status].count += 1;
      return acc;
    }, {});

    return {
      totalValue,
      totalItems,
      averageValue,
      categoryStats,
      statusStats
    };
  }, [assets]);

  // Export functions
  const handleExportExcel = async () => {
    try {
      const result = await exportToExcel(assets, 'estoque_completo', {
        includeStats: true,
        stats: costStats
      });
      
      if (result.success) {
        alert(`Exportação concluída! Arquivo: ${result.filename} (${result.recordCount} registros)`);
      } else {
        alert(`Erro na exportação: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar para Excel. Tente novamente.');
    }
  };

  const handleExportJSON = async () => {
    try {
      const result = await exportToJSON(assets, 'estoque_completo', {
        stats: costStats,
        filters: hasActiveFilters ? filters : null
      });
      
      if (result.success) {
        alert(`Exportação concluída! Arquivo: ${result.filename} (${result.recordCount} registros)`);
      } else {
        alert(`Erro na exportação: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      alert('Erro ao exportar para JSON. Tente novamente.');
    }
  };

  const handleExportFilteredExcel = async () => {
    if (!hasActiveFilters) {
      alert('Aplique pelo menos um filtro antes de exportar dados filtrados.');
      return;
    }
    
    try {
      const result = await exportFilteredToExcel(assets, filters, costStats, 'estoque_filtrado');
      
      if (result.success) {
        alert(`Exportação filtrada concluída! Arquivo: ${result.filename} (${result.recordCount} registros)`);
      } else {
        alert(`Erro na exportação: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao exportar Excel filtrado:', error);
      alert('Erro ao exportar dados filtrados para Excel. Tente novamente.');
    }
  };

  const handleExportFilteredJSON = async () => {
    if (!hasActiveFilters) {
      alert('Aplique pelo menos um filtro antes de exportar dados filtrados.');
      return;
    }
    
    try {
      const result = await exportFilteredToJSON(assets, filters, costStats, 'estoque_filtrado');
      
      if (result.success) {
        alert(`Exportação filtrada concluída! Arquivo: ${result.filename} (${result.recordCount} registros)`);
      } else {
        alert(`Erro na exportação: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao exportar JSON filtrado:', error);
      alert('Erro ao exportar dados filtrados para JSON. Tente novamente.');
    }
  };

  // Check if error is due to Supabase not being configured
  const isSupabaseNotConfigured = error && error.includes('Supabase not configured');

  // Show welcome screen if Supabase is not configured
  if (isSupabaseNotConfigured && !loading) {
    return <WelcomeScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque da Clínica</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todos os itens de estoque da clínica infantil
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
          {/* Export Buttons */}
          {!loading && !error && assets.length > 0 && (
            <div className="flex gap-2">
              {/* Export Dropdown */}
              <div className="relative group">
                <button className="btn-secondary flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      Exportação Geral
                    </div>
                    <button
                      onClick={handleExportExcel}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                      Excel (com estatísticas)
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2 text-blue-600" />
                      JSON (dados completos)
                    </button>
                    
                    {hasActiveFilters && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-t border-gray-100 mt-2">
                          Exportação Filtrada
                        </div>
                        <button
                          onClick={handleExportFilteredExcel}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                          Excel (filtrado)
                        </button>
                        <button
                          onClick={handleExportFilteredJSON}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          JSON (filtrado)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleCreateAsset}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Cost Statistics */}
      {!loading && !error && assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Value Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Valor Total do Estoque</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(costStats.totalValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Items Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Itens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {costStats.totalItems.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Average Value Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Valor Médio por Item</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(costStats.averageValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Details by Category and Status */}
      {!loading && !error && assets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowCostDetails(!showCostDetails)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Detalhes de Custo por Categoria</h3>
              </div>
              <div className="text-sm text-gray-500">
                {showCostDetails ? 'Ocultar' : 'Mostrar'} detalhes
              </div>
            </button>
          </div>

          {showCostDetails && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Statistics */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Por Categoria</h4>
                  <div className="space-y-3">
                    {Object.entries(costStats.categoryStats)
                      .sort(([,a], [,b]) => b.value - a.value)
                      .map(([category, stats]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{category}</span>
                            <button
                              onClick={() => handleFilterChange('tipo', category)}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Filtrar
                            </button>
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {stats.count} registro(s) • {stats.items} item(s)
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(stats.value)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Média: {formatCurrency(stats.items > 0 ? stats.value / stats.items : 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Statistics */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Por Status</h4>
                  <div className="space-y-3">
                    {Object.entries(costStats.statusStats)
                      .sort(([,a], [,b]) => b.value - a.value)
                      .map(([status, stats]) => (
                      <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${getStatusColorClass(status)}`}>
                                {status}
                              </span>
                            </div>
                            <button
                              onClick={() => handleFilterChange('status', status)}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Filtrar
                            </button>
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {stats.count} registro(s) • {stats.items} item(s)
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(stats.value)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Média: {formatCurrency(stats.items > 0 ? stats.value / stats.items : 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const highestCategory = Object.entries(costStats.categoryStats)
                        .sort(([,a], [,b]) => b.value - a.value)[0];
                      if (highestCategory) {
                        handleFilterChange('tipo', highestCategory[0]);
                      }
                    }}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
                  >
                    Ver categoria mais valiosa
                  </button>
                  <button
                    onClick={() => {
                      const activeItems = costStats.statusStats['Ativo'];
                      if (activeItems) {
                        handleFilterChange('status', 'Ativo');
                      }
                    }}
                    className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200"
                  >
                    Ver itens ativos
                  </button>
                  <button
                    onClick={() => {
                      const brokenItems = costStats.statusStats['quebrado'];
                      if (brokenItems) {
                        handleFilterChange('status', 'quebrado');
                      }
                    }}
                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200"
                  >
                    Ver itens quebrados
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={SEARCH_PLACEHOLDER}
                value={searchTerm}
                onChange={handleSearch}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center ${hasActiveFilters ? 'ring-2 ring-primary-500' : ''}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                  {Object.values(filters).filter(v => v).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filters.tipo}
                  onChange={(e) => handleFilterChange('tipo', e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos os tipos</option>
                  {ASSET_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos os status</option>
                  {ASSET_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <select
                  value={filters.localizacao}
                  onChange={(e) => handleFilterChange('localizacao', e.target.value)}
                  className="input-field"
                >
                  <option value="">Todas as localizações</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assets Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Carregando itens de estoque...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">Erro ao carregar os dados: {error}</p>
            <button
              onClick={() => fetchAssets(currentPage, searchTerm, filters)}
              className="mt-2 btn-primary"
            >
              Tentar novamente
            </button>
          </div>
        ) : assets.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || hasActiveFilters
                ? 'Nenhum item encontrado com os filtros aplicados.'
                : 'Nenhum item de estoque cadastrado ainda.'}
            </p>
            {!searchTerm && !hasActiveFilters && (
              <button
                onClick={handleCreateAsset}
                className="mt-4 btn-primary"
              >
                Cadastrar primeiro item
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conteúdo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {asset.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {asset.tipo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={asset.conteudo}>
                          {asset.conteudo}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="max-w-xs truncate" title={asset.descricao}>
                          {asset.descricao || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {asset.quantidade} {asset.unidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {asset.localizacao_atual || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatCurrency(parseFloat(asset.valor_aquisicao) || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency((parseFloat(asset.valor_aquisicao) || 0) * (parseInt(asset.quantidade) || 1))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="text-primary-600 hover:text-primary-700 p-1 rounded"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveAsset(asset)}
                            className="text-green-600 hover:text-green-700 p-1 rounded"
                            title="Movimentar"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewHistory(asset)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded"
                            title="Ver Histórico"
                          >
                            <History className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset)}
                            className="text-red-600 hover:text-red-700 p-1 rounded"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {assets.map((asset) => (
                <div key={asset.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{asset.codigo}</h3>
                      <p className="text-sm text-gray-700 mt-1">{asset.conteudo}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(asset.status)}`}>
                      {asset.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div><span className="font-medium">Tipo:</span> {asset.tipo}</div>
                    <div><span className="font-medium">Descrição:</span> {asset.descricao || '-'}</div>
                    <div><span className="font-medium">Quantidade:</span> {asset.quantidade} {asset.unidade}</div>
                    <div><span className="font-medium">Localização:</span> {asset.localizacao_atual || '-'}</div>
                    <div><span className="font-medium">Valor Unit.:</span> {formatCurrency(parseFloat(asset.valor_aquisicao) || 0)}</div>
                    <div><span className="font-medium">Valor Total:</span> <span className="font-semibold text-gray-900">{formatCurrency((parseFloat(asset.valor_aquisicao) || 0) * (parseInt(asset.quantidade) || 1))}</span></div>
                  </div>

                  <div className="mt-4 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEditAsset(asset)}
                      className="text-primary-600 hover:text-primary-700 p-2 rounded"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveAsset(asset)}
                      className="text-green-600 hover:text-green-700 p-2 rounded"
                      title="Movimentar"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleViewHistory(asset)}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded"
                      title="Ver Histórico"
                    >
                      <History className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset)}
                      className="text-red-600 hover:text-red-700 p-2 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {showAssetForm && (
        <AssetForm
          asset={editingAsset}
          onSave={onAssetSaved}
          onCancel={() => {
            setShowAssetForm(false);
            setEditingAsset(null);
          }}
        />
      )}

      {showMovementModal && selectedAsset && (
        <MovementModal
          asset={selectedAsset}
          onSave={onMovementSaved}
          onCancel={() => {
            setShowMovementModal(false);
            setSelectedAsset(null);
          }}
        />
      )}

      {showHistoryModal && selectedAsset && (
        <MovementHistoryModal
          asset={selectedAsset}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedAsset(null);
          }}
        />
      )}

      {showConfirmModal && (
        <ConfirmModal
          title="Confirmar exclusão"
          message={`Tem certeza que deseja excluir o item "${selectedAsset?.descricao}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;