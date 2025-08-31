import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './helpers';

/**
 * Exporta dados para Excel
 * @param {Array} data - Array de objetos com os dados
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {Object} options - Opções de exportação
 */
export const exportToExcel = (data, filename = 'estoque', options = {}) => {
  try {
    // Preparar dados para exportação
    const exportData = data.map(item => ({
      'Código': item.codigo || '',
      'Tipo': item.tipo || '',
      'Conteúdo': item.conteudo || '',
      'Descrição': item.descricao || '',
      'Quantidade': item.quantidade || 0,
      'Unidade': item.unidade || '',
      'Localização': item.localizacao_atual || '',
      'Responsável': item.responsavel_atual || '',
      'Status': item.status || '',
      'Valor Unitário': formatCurrency(parseFloat(item.valor_aquisicao) || 0),
      'Valor Total': formatCurrency((parseFloat(item.valor_aquisicao) || 0) * (parseInt(item.quantidade) || 1)),
      'Data Aquisição': item.data_aquisicao ? formatDate(item.data_aquisicao) : '',
      'Observações': item.observacoes || '',
      'Criado em': item.created_at ? formatDate(item.created_at) : '',
      'Atualizado em': item.updated_at ? formatDate(item.updated_at) : ''
    }));

    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Configurar largura das colunas
    const colWidths = [
      { wch: 10 }, // Código
      { wch: 15 }, // Tipo
      { wch: 25 }, // Conteúdo
      { wch: 30 }, // Descrição
      { wch: 10 }, // Quantidade
      { wch: 10 }, // Unidade
      { wch: 15 }, // Localização
      { wch: 15 }, // Responsável
      { wch: 12 }, // Status
      { wch: 15 }, // Valor Unitário
      { wch: 15 }, // Valor Total
      { wch: 12 }, // Data Aquisição
      { wch: 20 }, // Observações
      { wch: 12 }, // Criado em
      { wch: 12 }  // Atualizado em
    ];
    ws['!cols'] = colWidths;

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Estoque');

    // Se há estatísticas, adicionar uma segunda aba
    if (options.includeStats && options.stats) {
      const statsData = [
        { 'Métrica': 'Valor Total do Estoque', 'Valor': formatCurrency(options.stats.totalValue) },
        { 'Métrica': 'Total de Itens', 'Valor': options.stats.totalItems.toLocaleString() },
        { 'Métrica': 'Valor Médio por Item', 'Valor': formatCurrency(options.stats.averageValue) },
        { 'Métrica': '', 'Valor': '' }, // Linha em branco
        { 'Métrica': 'ESTATÍSTICAS POR CATEGORIA', 'Valor': '' },
        ...Object.entries(options.stats.categoryStats || {})
          .sort(([,a], [,b]) => b.value - a.value)
          .map(([category, stats]) => ({
            'Métrica': `${category} (${stats.count} registros)`,
            'Valor': formatCurrency(stats.value)
          })),
        { 'Métrica': '', 'Valor': '' }, // Linha em branco
        { 'Métrica': 'ESTATÍSTICAS POR STATUS', 'Valor': '' },
        ...Object.entries(options.stats.statusStats || {})
          .sort(([,a], [,b]) => b.value - a.value)
          .map(([status, stats]) => ({
            'Métrica': `${status} (${stats.count} registros)`,
            'Valor': formatCurrency(stats.value)
          }))
      ];

      const statsWs = XLSX.utils.json_to_sheet(statsData);
      statsWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, statsWs, 'Estatísticas');
    }

    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    // Fazer download
    XLSX.writeFile(wb, finalFilename);

    return {
      success: true,
      filename: finalFilename,
      recordCount: data.length
    };
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Exporta dados para JSON
 * @param {Array} data - Array de objetos com os dados
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {Object} options - Opções de exportação
 */
export const exportToJSON = (data, filename = 'estoque', options = {}) => {
  try {
    // Preparar dados para exportação
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        recordCount: data.length,
        exportedBy: 'Sistema de Estoque da Clínica',
        version: '1.0'
      },
      statistics: options.stats || null,
      filters: options.filters || null,
      data: data.map(item => ({
        id: item.id,
        codigo: item.codigo,
        tipo: item.tipo,
        conteudo: item.conteudo,
        descricao: item.descricao,
        quantidade: parseInt(item.quantidade) || 0,
        unidade: item.unidade,
        localizacao_atual: item.localizacao_atual,
        responsavel_atual: item.responsavel_atual,
        status: item.status,
        valor_aquisicao: parseFloat(item.valor_aquisicao) || 0,
        valor_total: (parseFloat(item.valor_aquisicao) || 0) * (parseInt(item.quantidade) || 1),
        data_aquisicao: item.data_aquisicao,
        observacoes: item.observacoes,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
    };

    // Converter para JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Criar blob e fazer download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const finalFilename = `${filename}_${timestamp}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename: finalFilename,
      recordCount: data.length
    };
  } catch (error) {
    console.error('Erro ao exportar para JSON:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Exporta dados filtrados para Excel
 * @param {Array} data - Array de objetos com os dados
 * @param {Object} filters - Filtros aplicados
 * @param {Object} stats - Estatísticas dos dados filtrados
 * @param {string} filename - Nome do arquivo (sem extensão)
 */
export const exportFilteredToExcel = (data, filters, stats, filename = 'estoque_filtrado') => {
  // Criar nome do arquivo baseado nos filtros
  const filterParts = [];
  if (filters.tipo) filterParts.push(`tipo-${filters.tipo}`);
  if (filters.status) filterParts.push(`status-${filters.status}`);
  if (filters.localizacao) filterParts.push(`local-${filters.localizacao}`);
  
  const filterSuffix = filterParts.length > 0 ? `_${filterParts.join('_')}` : '';
  const finalFilename = `${filename}${filterSuffix}`;

  return exportToExcel(data, finalFilename, {
    includeStats: true,
    stats,
    filters
  });
};

/**
 * Exporta dados filtrados para JSON
 * @param {Array} data - Array de objetos com os dados
 * @param {Object} filters - Filtros aplicados
 * @param {Object} stats - Estatísticas dos dados filtrados
 * @param {string} filename - Nome do arquivo (sem extensão)
 */
export const exportFilteredToJSON = (data, filters, stats, filename = 'estoque_filtrado') => {
  // Criar nome do arquivo baseado nos filtros
  const filterParts = [];
  if (filters.tipo) filterParts.push(`tipo-${filters.tipo}`);
  if (filters.status) filterParts.push(`status-${filters.status}`);
  if (filters.localizacao) filterParts.push(`local-${filters.localizacao}`);
  
  const filterSuffix = filterParts.length > 0 ? `_${filterParts.join('_')}` : '';
  const finalFilename = `${filename}${filterSuffix}`;

  return exportToJSON(data, finalFilename, {
    stats,
    filters
  });
};