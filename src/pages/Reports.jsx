import React, { useState, useEffect } from 'react';
import { BarChart3, Download, MapPin, Users, Package, Activity, FileText, Database, Upload } from 'lucide-react';
import { useAssets } from '../hooks/useAssets';
import { useMovements } from '../hooks/useMovements';
import { formatCurrency } from '../utils/helpers';
import { CSV_HEADERS, TOAST_MESSAGES } from '../utils/constants';
import { DataExporter, DataImporter } from '../utils/dataExport';
import { AuthManager, PERMISSIONS } from '../utils/security';
import toast from 'react-hot-toast';

const Reports = () => {
  const { assets, loading: assetsLoading, fetchAssets } = useAssets();
  const { movements, loading: movementsLoading, fetchAllMovements } = useMovements();
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [reportData, setReportData] = useState({
    inventoryByLocation: [],
    assetsByResponsible: [],
    summaryByType: [],
    assetsByStatus: []
  });

  // Load data on component mount
  useEffect(() => {
    fetchAssets();
    fetchAllMovements();
  }, []);

  // Generate reports when assets data changes
  useEffect(() => {
    if (assets.length > 0) {
      generateReports();
    }
  }, [assets]);

  const generateReports = () => {
    // Inventory by Location
    const locationMap = {};
    assets.forEach(asset => {
      const location = asset.localizacao_atual || 'Não informado';
      if (!locationMap[location]) {
        locationMap[location] = { quantidade: 0, valor_total: 0 };
      }
      locationMap[location].quantidade += 1;
      locationMap[location].valor_total += parseFloat(asset.valor_aquisicao || 0);
    });

    const inventoryByLocation = Object.entries(locationMap).map(([localizacao, data]) => ({
      localizacao,
      ...data
    }));

    // Assets by Responsible
    const responsibleMap = {};
    assets.forEach(asset => {
      const responsible = asset.responsavel_atual || 'Não informado';
      if (!responsibleMap[responsible]) {
        responsibleMap[responsible] = { quantidade: 0, valor_total: 0 };
      }
      responsibleMap[responsible].quantidade += 1;
      responsibleMap[responsible].valor_total += parseFloat(asset.valor_aquisicao || 0);
    });

    const assetsByResponsible = Object.entries(responsibleMap).map(([responsavel, data]) => ({
      responsavel,
      ...data
    }));

    // Summary by Type
    const typeMap = {};
    assets.forEach(asset => {
      const type = asset.tipo;
      if (!typeMap[type]) {
        typeMap[type] = { quantidade: 0, valor_total: 0 };
      }
      typeMap[type].quantidade += 1;
      typeMap[type].valor_total += parseFloat(asset.valor_aquisicao || 0);
    });

    const summaryByType = Object.entries(typeMap).map(([tipo, data]) => ({
      tipo,
      ...data
    }));

    // Assets by Status
    const statusMap = {};
    assets.forEach(asset => {
      const status = asset.status;
      if (!statusMap[status]) {
        statusMap[status] = { quantidade: 0, valor_total: 0 };
      }
      statusMap[status].quantidade += 1;
      statusMap[status].valor_total += parseFloat(asset.valor_aquisicao || 0);
    });

    const assetsByStatus = Object.entries(statusMap).map(([status, data]) => ({
      status,
      ...data
    }));

    setReportData({
      inventoryByLocation,
      assetsByResponsible,
      summaryByType,
      assetsByStatus
    });
  };

  const exportData = async (data, headers, filename, format = 'csv') => {
    // Check permissions
    if (!AuthManager.hasPermission(PERMISSIONS.REPORTS_EXPORT)) {
      toast.error('Você não tem permissão para exportar relatórios');
      return;
    }

    try {
      let result;
      
      switch (format) {
        case 'csv':
          result = await DataExporter.exportToCSV(data, headers, filename);
          break;
        case 'excel':
          result = await DataExporter.exportToExcel(data, headers, filename.replace('.csv', '.xlsx'));
          break;
        case 'json':
          result = await DataExporter.exportToJSON(data, filename.replace('.csv', '.json'));
          break;
        default:
          throw new Error('Formato de exportação não suportado');
      }
      
      if (result.success) {
        toast.success(`Relatório exportado com sucesso! ${result.rowCount} registros`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(error.message || TOAST_MESSAGES.ERROR.EXPORT_CSV);
    }
  };

  const tabs = [
    { id: 'inventory', name: 'Inventário por Localização', icon: MapPin },
    { id: 'responsible', name: 'Itens por Responsável', icon: Users },
    { id: 'type', name: 'Resumo por Tipo', icon: Package },
    { id: 'status', name: 'Itens por Status', icon: Activity }
  ];

  const isLoading = assetsLoading || movementsLoading;

  const renderExportButton = (data, headers, exportFilename) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    
    return (
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="btn-secondary flex items-center text-sm"
          disabled={!AuthManager.hasPermission(PERMISSIONS.REPORTS_EXPORT)}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </button>
        
        {showExportMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  exportData(data, headers, exportFilename, 'csv');
                  setShowExportMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </button>
              <button
                onClick={() => {
                  exportData(data, headers, exportFilename, 'excel');
                  setShowExportMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Database className="h-4 w-4 mr-2" />
                Excel
              </button>
              <button
                onClick={() => {
                  exportData(data, headers, exportFilename, 'json');
                  setShowExportMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Package className="h-4 w-4 mr-2" />
                JSON
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTable = (data, headers, exportFilename) => (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {tabs.find(tab => tab.id === activeTab)?.name}
        </h3>
        {renderExportButton(data, headers, exportFilename)}
      </div>

      {data.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Nenhum dado disponível para este relatório.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map(header => (
                  <th
                    key={header.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index} className="table-row">
                  {headers.map(header => (
                    <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {header.key.includes('valor') ? 
                        formatCurrency(row[header.key]) : 
                        row[header.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visualize e exporte relatórios do estoque da clínica
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {!isLoading && assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total de Itens</h3>
                <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(assets.reduce((sum, asset) => sum + parseFloat(asset.valor_aquisicao || 0), 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Itens Ativos</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {assets.filter(asset => asset.status === 'Ativo').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Localizações</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(assets.map(asset => asset.localizacao_atual).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Carregando relatórios...</p>
        </div>
      ) : (
        <div>
          {activeTab === 'inventory' && renderTable(
            reportData.inventoryByLocation,
            CSV_HEADERS.INVENTORY_BY_LOCATION,
            'inventario_por_localizacao.csv'
          )}

          {activeTab === 'responsible' && renderTable(
            reportData.assetsByResponsible,
            CSV_HEADERS.ASSETS_BY_RESPONSIBLE,
            'itens_por_responsavel.csv'
          )}

          {activeTab === 'type' && renderTable(
            reportData.summaryByType,
            CSV_HEADERS.SUMMARY_BY_TYPE,
            'resumo_por_tipo.csv'
          )}

          {activeTab === 'status' && renderTable(
            reportData.assetsByStatus,
            CSV_HEADERS.ASSETS_BY_STATUS,
            'itens_por_status.csv'
          )}
        </div>
      )}

      {/* Export All Data */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Exportar Dados Completos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            {renderExportButton(assets, CSV_HEADERS.ASSETS, 'todos_os_itens.csv')}
            <p className="text-xs text-gray-500 mt-1">Exportar Todos os Itens</p>
          </div>
          <div className="relative">
            {renderExportButton(movements, CSV_HEADERS.MOVEMENTS, 'todas_as_movimentacoes.csv')}
            <p className="text-xs text-gray-500 mt-1">Exportar Movimentações</p>
          </div>
          {AuthManager.hasPermission(PERMISSIONS.ADMIN_SETTINGS) && (
            <div className="relative">
              <button
                className="btn-secondary flex items-center justify-center w-full"
                onClick={() => {
                  // Implement bulk export functionality
                  toast.info('Funcionalidade em desenvolvimento');
                }}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Exportação em Lote
              </button>
              <p className="text-xs text-gray-500 mt-1">Exportação Avançada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;