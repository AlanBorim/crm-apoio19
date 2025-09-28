// src/services/leadImportService.ts

import { CreateLeadRequest } from '../components/leads/types/lead';

export interface ImportBatch {
  leads: CreateLeadRequest[];
  batchNumber: number;
  totalBatches: number;
}

export interface ImportProgress {
  processed: number;
  total: number;
  percentage: number;
  currentBatch: number;
  totalBatches: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: ImportError[];
  duplicates: number;
  message: string;
}

class LeadImportService {
  private baseUrl = '/api/leads';

  /**
   * Importa leads em lotes para melhor performance
   */
  async importLeads(
    leads: CreateLeadRequest[],
    batchSize: number = 10,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> {
    try {
      const totalBatches = Math.ceil(leads.length / batchSize);
      let imported = 0;
      let failed = 0;
      let duplicates = 0;
      const allErrors: ImportError[] = [];

      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        try {
          const result = await this.importBatch({
            leads: batch,
            batchNumber,
            totalBatches
          });

          imported += result.imported;
          failed += result.failed;
          duplicates += result.duplicates;
          allErrors.push(...result.errors);

          // Notificar progresso
          if (onProgress) {
            onProgress({
              processed: i + batch.length,
              total: leads.length,
              percentage: ((i + batch.length) / leads.length) * 100,
              currentBatch: batchNumber,
              totalBatches,
              errors: allErrors
            });
          }

          // Pequena pausa entre lotes para não sobrecarregar o servidor
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Erro no lote ${batchNumber}:`, error);
          failed += batch.length;
          
          // Adicionar erros do lote
          batch.forEach((_, index) => {
            allErrors.push({
              row: i + index + 2, // +2 para considerar cabeçalho e índice baseado em 1
              field: 'Geral',
              message: 'Erro no processamento do lote',
              value: ''
            });
          });
        }
      }

      return {
        success: imported > 0,
        imported,
        failed,
        duplicates,
        errors: allErrors,
        message: `Importação concluída: ${imported} leads importados, ${failed} falharam`
      };

    } catch (error) {
      console.error('Erro na importação:', error);
      return {
        success: false,
        imported: 0,
        failed: leads.length,
        duplicates: 0,
        errors: [{
          row: 0,
          field: 'Sistema',
          message: 'Erro interno do sistema',
          value: ''
        }],
        message: 'Erro interno durante a importação'
      };
    }
  }

  /**
   * Importa um lote específico de leads
   */
  private async importBatch(batch: ImportBatch): Promise<ImportResult> {
    const response = await fetch(`${this.baseUrl}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicionar headers de autenticação conforme necessário
      },
      body: JSON.stringify({
        leads: batch.leads,
        batchNumber: batch.batchNumber,
        totalBatches: batch.totalBatches
      })
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Valida se um email já existe no sistema
   */
  async checkDuplicateEmails(emails: string[]): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/check-duplicates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.duplicates || [];
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de importação
   */
  async getImportStats(): Promise<{
    totalImported: number;
    lastImport: string;
    averagePerDay: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/import/stats`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalImported: 0,
        lastImport: '',
        averagePerDay: 0
      };
    }
  }

  /**
   * Baixa template CSV para importação
   */
  downloadTemplate(): void {
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Empresa',
      'Cargo',
      'Origem',
      'Interesse',
      'Estágio',
      'Temperatura',
      'Endereço',
      'Cidade',
      'Estado',
      'CEP',
      'Valor Estimado',
      'Próximo Contato',
      'Responsável (ID)'
    ];

    const exampleRow = [
      'João Silva',
      'joao@email.com',
      '(11) 99999-9999',
      'Empresa ABC',
      'Gerente',
      'Website',
      'Interessado em automação',
      'novo',
      'morno',
      'Rua das Flores, 123',
      'São Paulo',
      'SP',
      '01234-567',
      '50000',
      '2024-12-31',
      '1'
    ];

    const csvContent = [
      headers.join(','),
      exampleRow.join(','),
      // Linha adicional com instruções
      '# Instruções:',
      '# - Campos obrigatórios: Nome, Empresa, Endereço, Cidade, Estado, CEP, Valor Estimado, Próximo Contato',
      '# - Estágios válidos: novo, contatado, reuniao, proposta, fechado, perdido',
      '# - Temperaturas válidas: frio, morno, quente',
      '# - Formato de data: YYYY-MM-DD',
      '# - Use codificação UTF-8 para caracteres especiais'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_importacao_leads.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Valida formato de arquivo CSV
   */
  validateCSVFile(file: File): { valid: boolean; error?: string } {
    // Verificar extensão
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return {
        valid: false,
        error: 'Arquivo deve ter extensão .csv'
      };
    }

    // Verificar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo permitido: 10MB'
      };
    }

    // Verificar tipo MIME
    if (file.type && !file.type.includes('csv') && !file.type.includes('text')) {
      return {
        valid: false,
        error: 'Tipo de arquivo inválido'
      };
    }

    return { valid: true };
  }

  /**
   * Parse de arquivo CSV com tratamento de erros
   */
  async parseCSVFile(file: File): Promise<{
    headers: string[];
    rows: Record<string, string>[];
    errors: string[];
  }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const errors: string[] = [];

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));

          if (lines.length < 2) {
            errors.push('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');
            resolve({ headers: [], rows: [], errors });
            return;
          }

          // Parse mais robusto de CSV
          const parseCSVLine = (line: string): string[] => {
            const result = [];
            let current = '';
            let inQuotes = false;
            let i = 0;

            while (i < line.length) {
              const char = line[i];
              const nextChar = line[i + 1];

              if (char === '"') {
                if (inQuotes && nextChar === '"') {
                  // Aspas duplas escapadas
                  current += '"';
                  i += 2;
                  continue;
                } else {
                  // Toggle estado das aspas
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
              i++;
            }

            result.push(current.trim());
            return result.map(field => field.replace(/^"|"$/g, ''));
          };

          const headers = parseCSVLine(lines[0]);
          const rows = lines.slice(1).map((line, index) => {
            try {
              const values = parseCSVLine(line);
              const row: Record<string, string> = {};
              
              headers.forEach((header, i) => {
                row[header] = values[i] || '';
              });
              
              return row;
            } catch (error) {
              errors.push(`Erro na linha ${index + 2}: formato inválido`);
              return null;
            }
          }).filter(Boolean) as Record<string, string>[];

          resolve({ headers, rows, errors });

        } catch (error) {
          errors.push('Erro ao processar arquivo CSV');
          resolve({ headers: [], rows: [], errors });
        }
      };

      reader.onerror = () => {
        errors.push('Erro ao ler arquivo');
        resolve({ headers: [], rows: [], errors });
      };

      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Limpa e normaliza dados de importação
   */
  cleanImportData(data: Record<string, string>[]): Record<string, string>[] {
    return data.map(row => {
      const cleanRow: Record<string, string> = {};
      
      Object.keys(row).forEach(key => {
        let value = row[key];
        
        // Remover espaços extras
        value = value.trim();
        
        // Normalizar campos específicos
        if (key.toLowerCase().includes('email')) {
          value = value.toLowerCase();
        }
        
        if (key.toLowerCase().includes('telefone') || key.toLowerCase().includes('phone')) {
          // Manter apenas números
          value = value.replace(/\D/g, '');
        }
        
        if (key.toLowerCase().includes('cep')) {
          // Manter apenas números
          value = value.replace(/\D/g, '');
        }
        
        cleanRow[key] = value;
      });
      
      return cleanRow;
    });
  }
}

export const leadImportService = new LeadImportService();
export default leadImportService;
