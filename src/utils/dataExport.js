import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Enhanced export utilities with multiple formats
export class DataExporter {
  static async exportToCSV(data, headers, filename, options = {}) {
    const {
      delimiter = ',',
      encoding = 'utf-8-sig', // BOM for Excel compatibility
      dateFormat = 'dd/MM/yyyy',
      currencySymbol = 'R$'
    } = options;

    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Create header row
    const headerRow = headers.map(header => this.escapeCSVField(header.label)).join(delimiter);
    
    // Create data rows with enhanced formatting
    const dataRows = data.map(row => {
      return headers.map(header => {
        let value = row[header.key];
        
        // Handle different data types
        if (value === null || value === undefined) {
          value = '';
        } else if (header.key.includes('valor') && typeof value === 'number') {
          // Format currency
          value = this.formatCurrency(value, currencySymbol);
        } else if (header.key.includes('data') && value) {
          // Format dates
          value = this.formatDate(value, dateFormat);
        } else if (typeof value === 'boolean') {
          value = value ? 'Sim' : 'Não';
        } else if (typeof value === 'string') {
          value = value.trim();
        }
        
        return this.escapeCSVField(value);
      }).join(delimiter);
    });

    const csvContent = [headerRow, ...dataRows].join('\n');
    
    // Create blob with BOM for proper encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: `text/csv;charset=${encoding}` });
    
    this.downloadFile(blob, filename);
    return { success: true, rowCount: data.length };
  }

  static async exportToExcel(data, headers, filename, options = {}) {
    // For Excel export, we'll use a more sophisticated approach
    // This would typically require a library like xlsx
    console.warn('Excel export not implemented. Using enhanced CSV instead.');
    return this.exportToCSV(data, headers, filename.replace('.xlsx', '.csv'), options);
  }

  static async exportToJSON(data, filename, options = {}) {
    const { pretty = true, dateFormat = 'yyyy-MM-dd' } = options;

    // Format data for JSON export
    const formattedData = data.map(item => {
      const formatted = { ...item };
      
      // Format dates
      Object.keys(formatted).forEach(key => {
        if (key.includes('data') && formatted[key]) {
          formatted[key] = this.formatDate(formatted[key], dateFormat);
        }
      });
      
      return formatted;
    });

    const jsonContent = pretty 
      ? JSON.stringify(formattedData, null, 2)
      : JSON.stringify(formattedData);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    this.downloadFile(blob, filename);
    
    return { success: true, rowCount: data.length };
  }

  static escapeCSVField(field) {
    if (field === null || field === undefined) return '';
    
    const stringField = String(field);
    
    // Escape quotes and wrap in quotes if necessary
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    
    return stringField;
  }

  static formatCurrency(value, symbol = 'R$') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      currencyDisplay: 'symbol'
    }).format(value).replace('R$', symbol);
  }

  static formatDate(date, formatStr = 'dd/MM/yyyy') {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, formatStr, { locale: ptBR });
    } catch {
      return date;
    }
  }

  static downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

// Enhanced import utilities
export class DataImporter {
  static async importFromCSV(file, expectedHeaders, options = {}) {
    const {
      delimiter = ',',
      skipRows = 0,
      dateFormat = 'dd/MM/yyyy',
      validateData = true
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length <= skipRows + 1) {
            reject(new Error('Arquivo vazio ou sem dados'));
            return;
          }

          // Parse header
          const headerLine = lines[skipRows];
          const headers = this.parseCSVLine(headerLine, delimiter);
          
          // Validate headers
          const missingHeaders = expectedHeaders.filter(expected => 
            !headers.some(header => header.toLowerCase().includes(expected.toLowerCase()))
          );
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Colunas obrigatórias não encontradas: ${missingHeaders.join(', ')}`));
            return;
          }

          // Parse data
          const data = [];
          const errors = [];
          
          for (let i = skipRows + 1; i < lines.length; i++) {
            try {
              const values = this.parseCSVLine(lines[i], delimiter);
              const row = this.mapRowToObject(headers, values, dateFormat);
              
              if (validateData) {
                const validationErrors = this.validateImportRow(row);
                if (validationErrors.length > 0) {
                  errors.push({ row: i + 1, errors: validationErrors });
                  continue;
                }
              }
              
              data.push(row);
            } catch (error) {
              errors.push({ row: i + 1, errors: [error.message] });
            }
          }

          resolve({
            success: true,
            data,
            errors,
            totalRows: lines.length - skipRows - 1,
            validRows: data.length,
            invalidRows: errors.length
          });
        } catch (error) {
          reject(new Error(`Erro ao processar arquivo: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file, 'utf-8');
    });
  }

  static parseCSVLine(line, delimiter) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  static mapRowToObject(headers, values, dateFormat) {
    const row = {};
    
    headers.forEach((header, index) => {
      let value = values[index] || '';
      const key = this.normalizeKey(header);
      
      // Type conversion based on key
      if (key.includes('valor') && value) {
        // Parse currency
        value = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
      } else if (key.includes('data') && value) {
        // Parse date
        try {
          value = parse(value, dateFormat, new Date());
          if (isNaN(value.getTime())) throw new Error('Invalid date');
        } catch {
          throw new Error(`Data inválida: ${value}`);
        }
      }
      
      row[key] = value;
    });
    
    return row;
  }

  static normalizeKey(header) {
    return header
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  static validateImportRow(row) {
    const errors = [];
    
    // Basic validations
    if (!row.descricao || row.descricao.trim() === '') {
      errors.push('Descrição é obrigatória');
    }
    
    if (!row.categoria || row.categoria.trim() === '') {
      errors.push('Categoria é obrigatória');
    }
    
    if (row.valor_aquisicao && (isNaN(row.valor_aquisicao) || row.valor_aquisicao < 0)) {
      errors.push('Valor de aquisição deve ser um número positivo');
    }
    
    return errors;
  }
}

// Batch operations for import
export class BatchOperations {
  static async importAssets(data, onProgress) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    const batchSize = 10; // Process in batches to avoid overwhelming the database
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        const { data: insertedData, error } = await supabase
          .from('bens_patrimoniais')
          .insert(batch)
          .select();

        if (error) throw error;
        
        results.success += insertedData.length;
        
        if (onProgress) {
          onProgress({
            processed: Math.min(i + batchSize, data.length),
            total: data.length,
            success: results.success,
            failed: results.failed
          });
        }
      } catch (error) {
        results.failed += batch.length;
        results.errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: error.message
        });
      }
    }

    return results;
  }
}

// Export templates
export const ExportTemplates = {
  ASSETS_BASIC: [
    { key: 'codigo', label: 'Código' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'status', label: 'Status' }
  ],
  
  ASSETS_COMPLETE: [
    { key: 'codigo', label: 'Código' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'valor_aquisicao', label: 'Valor de Aquisição' },
    { key: 'data_aquisicao', label: 'Data de Aquisição' },
    { key: 'localizacao_atual', label: 'Localização Atual' },
    { key: 'responsavel_atual', label: 'Responsável Atual' },
    { key: 'status', label: 'Status' },
    { key: 'observacoes', label: 'Observações' },
    { key: 'created_at', label: 'Data de Cadastro' }
  ],
  
  MOVEMENTS: [
    { key: 'bem_codigo', label: 'Código do Item' },
    { key: 'data_movimentacao', label: 'Data da Movimentação' },
    { key: 'localizacao_origem', label: 'Localização de Origem' },
    { key: 'localizacao_destino', label: 'Localização de Destino' },
    { key: 'responsavel_origem', label: 'Responsável de Origem' },
    { key: 'responsavel_destino', label: 'Responsável de Destino' },
    { key: 'observacoes', label: 'Observações' }
  ]
};