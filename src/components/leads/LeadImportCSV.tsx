import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  Info,
  RefreshCw
} from 'lucide-react';
import { CreateLeadRequest, LeadStage, LeadTemperature } from './types/lead';
import leadService from '../../services/leadService';
import { useNotifications } from '../../services/notificationService';

interface CSVRow {
  [key: string]: string;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  imported: number;
  failed: number;
  errors: ImportError[];
}

interface FieldMapping {
  csvField: string;
  leadField: string;
  required: boolean;
  transform?: (value: string) => any;
  validate?: (value: string) => string | null;
}

interface LeadImportCSVProps {
  onImportComplete: (summary: ImportSummary) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const LeadImportCSV: React.FC<LeadImportCSVProps> = ({
  onImportComplete,
  onCancel,
  isOpen
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<ImportSummary | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState(5);
  const [importStatus, setImportStatus] = useState<string>('');
  const [duplicatesFromDB, setDuplicatesFromDB] = useState<string[]>([]);
  const [detectedSeparator, setDetectedSeparator] = useState<string>('');
  const [detectedEncoding, setDetectedEncoding] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Usar o hook de notificações existente
  const { createNotification } = useNotifications();

  // Definição dos campos disponíveis para mapeamento
  const availableFields = [
    { key: 'name', label: 'Nome *', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Telefone', required: false },
    { key: 'company', label: 'Empresa *', required: true },
    { key: 'position', label: 'Cargo', required: false },
    { key: 'source', label: 'Origem', required: false },
    { key: 'interest', label: 'Interesse', required: false },
    { key: 'stage', label: 'Estágio', required: false },
    { key: 'temperature', label: 'Temperatura', required: false },
    { key: 'address', label: 'Endereço *', required: true },
    { key: 'city', label: 'Cidade *', required: true },
    { key: 'state', label: 'Estado *', required: true },
    { key: 'cep', label: 'CEP *', required: true },
    { key: 'value', label: 'Valor Estimado *', required: true },
    { key: 'next_contact', label: 'Próximo Contato *', required: true },
    { key: 'assigned_to', label: 'Responsável (ID)', required: false }
  ];

  // Função para mostrar notificação usando o serviço existente
  const showNotification = async (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string) => {
    try {
      await createNotification({
        title: title || (type === 'success' ? 'Sucesso' : type === 'error' ? 'Erro' : type === 'warning' ? 'Aviso' : 'Informação'),
        message,
        type
      });
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      // Fallback para alert se a notificação falhar
      if (type === 'error') {
        alert(`Erro: ${message}`);
      }
    }
  };

  // Função para detectar a codificação do arquivo
  const detectEncoding = (buffer: ArrayBuffer): string => {
    const uint8Array = new Uint8Array(buffer);

    // Verificar BOM UTF-8
    if (uint8Array.length >= 3 &&
      uint8Array[0] === 0xEF &&
      uint8Array[1] === 0xBB &&
      uint8Array[2] === 0xBF) {
      return 'UTF-8';
    }

    // Verificar BOM UTF-16 LE
    if (uint8Array.length >= 2 &&
      uint8Array[0] === 0xFF &&
      uint8Array[1] === 0xFE) {
      return 'UTF-16LE';
    }

    // Verificar BOM UTF-16 BE
    if (uint8Array.length >= 2 &&
      uint8Array[0] === 0xFE &&
      uint8Array[1] === 0xFF) {
      return 'UTF-16BE';
    }

    // Tentar detectar UTF-8 vs Latin-1
    let hasHighBytes = false;
    let validUtf8Sequences = 0;
    let invalidUtf8Sequences = 0;

    for (let i = 0; i < Math.min(uint8Array.length, 1000); i++) {
      const byte = uint8Array[i];

      if (byte > 127) {
        hasHighBytes = true;

        // Verificar sequência UTF-8 válida
        if ((byte & 0xE0) === 0xC0) { // 110xxxxx - 2 bytes
          if (i + 1 < uint8Array.length && (uint8Array[i + 1] & 0xC0) === 0x80) {
            validUtf8Sequences++;
            i++; // Pular próximo byte
          } else {
            invalidUtf8Sequences++;
          }
        } else if ((byte & 0xF0) === 0xE0) { // 1110xxxx - 3 bytes
          if (i + 2 < uint8Array.length &&
            (uint8Array[i + 1] & 0xC0) === 0x80 &&
            (uint8Array[i + 2] & 0xC0) === 0x80) {
            validUtf8Sequences++;
            i += 2; // Pular próximos 2 bytes
          } else {
            invalidUtf8Sequences++;
          }
        } else if ((byte & 0xF8) === 0xF0) { // 11110xxx - 4 bytes
          if (i + 3 < uint8Array.length &&
            (uint8Array[i + 1] & 0xC0) === 0x80 &&
            (uint8Array[i + 2] & 0xC0) === 0x80 &&
            (uint8Array[i + 3] & 0xC0) === 0x80) {
            validUtf8Sequences++;
            i += 3; // Pular próximos 3 bytes
          } else {
            invalidUtf8Sequences++;
          }
        } else {
          invalidUtf8Sequences++;
        }
      }
    }

    if (!hasHighBytes) {
      return 'ASCII';
    }

    if (validUtf8Sequences > 0 && invalidUtf8Sequences === 0) {
      return 'UTF-8';
    }

    if (validUtf8Sequences > invalidUtf8Sequences) {
      return 'UTF-8';
    }

    return 'ISO-8859-1'; // Latin-1
  };

  // Função para detectar o separador do CSV
  const detectSeparator = (text: string): string => {
    const lines = text.split('\n').slice(0, 5); // Analisar apenas as primeiras 5 linhas
    const separators = [',', ';', '\t', '|'];
    const separatorCounts: Record<string, number> = {};

    separators.forEach(sep => {
      separatorCounts[sep] = 0;
      lines.forEach(line => {
        const count = (line.match(new RegExp(`\\${sep}`, 'g')) || []).length;
        separatorCounts[sep] += count;
      });
    });

    // Encontrar o separador mais comum
    let bestSeparator = ',';
    let maxCount = 0;

    Object.entries(separatorCounts).forEach(([sep, count]) => {
      if (count > maxCount) {
        maxCount = count;
        bestSeparator = sep;
      }
    });

    return bestSeparator;
  };

  // Função melhorada para fazer parse do CSV
  const parseCSVLine = (line: string, separator: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if ((char === '"' || char === "'") && !inQuotes) {
        // Início de string com aspas
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        // Possível fim de string com aspas
        if (nextChar === quoteChar) {
          // Aspas escapadas
          current += char;
          i++; // Pular próximo caractere
        } else {
          // Fim da string com aspas
          inQuotes = false;
          quoteChar = '';
        }
      } else if (char === separator && !inQuotes) {
        // Separador encontrado fora de aspas
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  // Função para limpar e normalizar texto
  const cleanText = (text: string): string => {
    return text
      .replace(/[""]/g, '"') // Normalizar aspas
      .replace(/['']/g, "'") // Normalizar apóstrofes
      .replace(/[–—]/g, '-') // Normalizar hífens
      .replace(/\u00A0/g, ' ') // Substituir espaços não-quebráveis
      .replace(/\r\n/g, '\n') // Normalizar quebras de linha
      .replace(/\r/g, '\n') // Normalizar quebras de linha
      .trim();
  };

  // Função para verificar duplicatas na base de dados
  const checkDuplicatesInDatabase = async (emails: string[]): Promise<string[]> => {
    try {
      const validEmails = emails.filter(email => email && email.trim());
      if (validEmails.length === 0) return [];

      // Chamar API para verificar duplicatas
      const response = await fetch('/api/leads/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ emails: validEmails })
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar duplicatas na base de dados');
      }

      const data = await response.json();
      return data.duplicates || [];
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      await showNotification('Erro ao verificar duplicatas na base de dados', 'error');
      return [];
    }
  };

  // Função para processar arquivo CSV
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      await showNotification('Por favor, selecione um arquivo CSV válido.', 'error');
      return;
    }

    try {
      // Ler arquivo como ArrayBuffer para detectar codificação
      const arrayBuffer = await file.arrayBuffer();
      const encoding = detectEncoding(arrayBuffer);
      setDetectedEncoding(encoding);

      console.log('Codificação detectada:', encoding);

      // Ler arquivo com a codificação detectada
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCSV(text, file.name);
      };

      // Usar a codificação apropriada
      if (encoding === 'UTF-16LE' || encoding === 'UTF-16BE') {
        reader.readAsText(file, 'UTF-16');
      } else if (encoding === 'ISO-8859-1') {
        reader.readAsText(file, 'ISO-8859-1');
      } else {
        reader.readAsText(file, 'UTF-8');
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      await showNotification('Erro ao processar o arquivo. Verifique se é um CSV válido.', 'error');
    }
  };

  // Função para fazer parse do CSV
  const parseCSV = async (text: string, filename: string) => {
    try {
      // Limpar e normalizar o texto
      const cleanedText = cleanText(text);

      // Detectar separador
      const separator = detectSeparator(cleanedText);
      setDetectedSeparator(separator);

      console.log('Separador detectado:', separator === ',' ? 'vírgula' : separator === ';' ? 'ponto e vírgula' : separator);

      const lines = cleanedText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        await showNotification('O arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados.', 'error');
        return;
      }

      // Parse do cabeçalho
      const headers = parseCSVLine(lines[0], separator)
        .map(h => cleanText(h.replace(/['"]/g, '')))
        .filter(h => h.length > 0);

      if (headers.length === 0) {
        await showNotification('Não foi possível identificar as colunas do arquivo CSV.', 'error');
        return;
      }

      // Parse das linhas de dados
      const rows = lines.slice(1).map((line, index) => {
        const values = parseCSVLine(line, separator);
        const row: CSVRow = {};

        headers.forEach((header, i) => {
          const value = values[i] || '';
          row[header] = cleanText(value.replace(/['"]/g, ''));
        });

        return row;
      }).filter(row => {
        // Filtrar linhas vazias
        return Object.values(row).some(value => value.trim().length > 0);
      });

      if (rows.length === 0) {
        await showNotification('Nenhuma linha de dados válida encontrada no arquivo.', 'error');
        return;
      }

      setCsvHeaders(headers);
      setCsvData(rows);
      setStep('mapping');

      // Auto-mapeamento baseado em nomes similares
      const autoMapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        const field = availableFields.find(f => {
          const lowerLabel = f.label.toLowerCase().replace(' *', '');
          return lowerHeader.includes(lowerLabel) ||
            lowerLabel.includes(lowerHeader) ||
            f.key === lowerHeader;
        });
        if (field) {
          autoMapping[header] = field.key;
        }
      });
      setFieldMappings(autoMapping);

      await showNotification(
        `Arquivo ${filename} processado com sucesso! ${rows.length} linhas de dados encontradas. Separador: ${separator === ',' ? 'vírgula' : separator === ';' ? 'ponto e vírgula' : separator
        }. Codificação: ${detectedEncoding}.`,
        'success',
        'Arquivo Processado'
      );

    } catch (error) {
      console.error('Erro ao fazer parse do CSV:', error);
      await showNotification('Erro ao processar o arquivo CSV. Verifique o formato e tente novamente.', 'error');
    }
  };

  // Função para validar dados
  const validateData = async (): Promise<ImportSummary> => {
    const errors: ImportError[] = [];
    let validCount = 0;
    let duplicateCount = 0;
    const seenEmails = new Set<string>();

    // Coletar emails para verificar duplicatas na base
    const emailField = Object.keys(fieldMappings).find(k => fieldMappings[k] === 'email');
    const emailsToCheck: string[] = [];

    if (emailField) {
      csvData.forEach(row => {
        const email = row[emailField]?.trim();
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          emailsToCheck.push(email);
        }
      });
    }

    // Verificar duplicatas na base de dados
    const dbDuplicates = await checkDuplicatesInDatabase(emailsToCheck);
    setDuplicatesFromDB(dbDuplicates);

    if (dbDuplicates.length > 0) {
      await showNotification(`${dbDuplicates.length} emails duplicados encontrados na base de dados e serão ignorados.`, 'warning', 'Duplicatas Detectadas');
    }

    csvData.forEach((row, index) => {
      let rowValid = true;


      // Verificar campos obrigatórios apenas se foram mapeados
      availableFields
        .filter(f => f.required)
        .forEach(field => {
          const csvField = Object.keys(fieldMappings).find(k => fieldMappings[k] === field.key);
          if (csvField && !row[csvField]?.trim()) {
            errors.push({
              row: index + 2,
              field: field.label,
              message: 'Campo obrigatório não preenchido',
              value: row[csvField] || ''
            });
            rowValid = false;
          }
        });

      // Validar email
      if (emailField && row[emailField]) {
        const email = row[emailField].trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push({
            row: index + 2,
            field: 'Email',
            message: 'Formato de email inválido',
            value: email
          });
          rowValid = false;
        } else if (email && seenEmails.has(email)) {
          duplicateCount++;
          errors.push({
            row: index + 2,
            field: 'Email',
            message: 'Email duplicado no arquivo',
            value: email
          });
          rowValid = false;
        } else if (email && dbDuplicates.includes(email)) {
          duplicateCount++;
          errors.push({
            row: index + 2,
            field: 'Email',
            message: 'Email já existe na base de dados',
            value: email
          });
          rowValid = false;
        } else if (email) {
          seenEmails.add(email);
        }
      }

      // Validar telefone
      const phoneField = Object.keys(fieldMappings).find(k => fieldMappings[k] === 'phone');
      if (phoneField && row[phoneField]) {
        const phone = row[phoneField].replace(/\D/g, '');
        if (phone && (phone.length < 10 || phone.length > 11)) {
          errors.push({
            row: index + 2,
            field: 'Telefone',
            message: 'Telefone deve ter 10 ou 11 dígitos',
            value: row[phoneField]
          });
          rowValid = false;
        }
      }

      // Validar valor
      const valueField = Object.keys(fieldMappings).find(k => fieldMappings[k] === 'value');
      if (valueField && row[valueField]) {
        const value = parseFloat(row[valueField].replace(/[^\d,.-]/g, '').replace(',', '.'));
        if (isNaN(value) || value < 0) {
          errors.push({
            row: index + 2,
            field: 'Valor Estimado',
            message: 'Valor deve ser um número positivo',
            value: row[valueField]
          });
          rowValid = false;
        }
      }

      // Validar data de próximo contato
      const nextContactField = Object.keys(fieldMappings).find(k => fieldMappings[k] === 'next_contact');
      if (nextContactField && row[nextContactField]) {
        const dateValue = row[nextContactField];
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          errors.push({
            row: index + 2,
            field: 'Próximo Contato',
            message: 'Data inválida (use formato YYYY-MM-DD)',
            value: dateValue
          });
          rowValid = false;
        }
      }

      // Validar estágio
      const stageField = Object.keys(fieldMappings).find(k => fieldMappings[k] === 'stage');
      if (stageField && row[stageField]) {
        const validStages = ['novo', 'contatado', 'reuniao', 'proposta', 'fechado', 'perdido'];
        if (!validStages.includes(row[stageField].toLowerCase())) {
          errors.push({
            row: index + 2,
            field: 'Estágio',
            message: 'Estágio inválido. Use: novo, contatado, reuniao, proposta, fechado, perdido',
            value: row[stageField]
          });
          rowValid = false;
        }
      }

      // Validar temperatura
      const temperatureField = Object.keys(fieldMappings).find(k => fieldMappings[k] === 'temperature');
      if (temperatureField && row[temperatureField]) {
        const validTemperatures = ['frio', 'morno', 'quente'];
        if (!validTemperatures.includes(row[temperatureField].toLowerCase())) {
          errors.push({
            row: index + 2,
            field: 'Temperatura',
            message: 'Temperatura inválida. Use: frio, morno, quente',
            value: row[temperatureField]
          });
          rowValid = false;
        }
      }

      if (rowValid) {
        validCount++;
      }
    });

    if (errors.length > 0) {
      await showNotification(`${errors.length} erros de validação encontrados. Verifique os dados antes de continuar.`, 'error', 'Erros de Validação');
    }

    return {
      total: csvData.length,
      valid: validCount,
      invalid: csvData.length - validCount,
      duplicates: duplicateCount,
      imported: 0,
      failed: 0,
      errors
    };
  };

  // Função para processar importação REAL
  const processImport = async () => {
    setStep('importing');
    setImportProgress(0);
    setImportStatus('Iniciando importação...');

    await showNotification('Iniciando processo de importação de leads...', 'info', 'Importação Iniciada');

    try {
      // Filtrar apenas linhas válidas
      const validRows = csvData.filter((_, index) => {
        const rowErrors = validationResults?.errors.filter(e => e.row === index + 2) || [];
        return rowErrors.length === 0;
      });

      console.log('Linhas válidas para importação:', validRows.length);
      setImportStatus(`Processando ${validRows.length} leads válidos...`);

      // Preparar dados dos leads
      const leads: CreateLeadRequest[] = validRows.map((row, index) => {
        const lead: any = {};

        Object.keys(fieldMappings).forEach(csvField => {
          const leadField = fieldMappings[csvField];
          let value: any = row[csvField]?.trim() || '';

          // Transformações específicas por campo
          switch (leadField) {
            case 'phone':
              value = value.replace(/\D/g, '');
              break;
            case 'value':
              value = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
              break;
            case 'stage':
              value = value.toLowerCase() as LeadStage;
              break;
            case 'temperature':
              value = value.toLowerCase() as LeadTemperature;
              break;
            case 'cep':
              value = value.replace(/\D/g, '');
              break;
            case 'assigned_to':
              value = value ? parseInt(value) : undefined;
              break;
            case 'next_contact':
              // Garantir formato de data correto
              if (value) {
                const date = new Date(value);
                value = date.toISOString().split('T')[0]; // YYYY-MM-DD
              }
              break;
          }

          if (value !== '' && value !== undefined && value !== null) {
            lead[leadField] = value;
          }
        });

        // Valores padrão obrigatórios
        if (!lead.stage) lead.stage = 'novo';
        if (!lead.temperature) lead.temperature = 'frio';
        if (!lead.source) lead.source = 'Importação CSV';

        console.log(`Lead ${index + 1} preparado:`, lead);
        return lead as CreateLeadRequest;
      });

      // Importação real usando leadService
      let imported = 0;
      let failed = 0;
      const importErrors: ImportError[] = [];

      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        const originalRowIndex = i + 2;

        try {
          setImportStatus(`Importando lead ${i + 1} de ${leads.length}: ${lead.name}...`);
          console.log(`Tentando importar lead ${i + 1}:`, lead);

          // Chamar o serviço real de criação de lead
          const response = await leadService.createLead(lead);

          console.log(`Lead ${i + 1} criado com sucesso:`, response);
          imported++;

        } catch (error: any) {
          console.error(`Erro ao importar lead ${i + 1}:`, error);
          failed++;

          let errorMessage = 'Erro desconhecido';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          // Verificar se é erro de email duplicado
          if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('duplicado')) {
            errorMessage = 'Email já existe na base de dados';
          }

          importErrors.push({
            row: originalRowIndex,
            field: 'Geral',
            message: errorMessage,
            value: lead.name || lead.email || 'Lead sem identificação'
          });
        }

        // Atualizar progresso
        const progress = ((i + 1) / leads.length) * 100;
        setImportProgress(progress);

        // Pequena pausa para não sobrecarregar o servidor
        if (i < leads.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Atualizar resultados finais
      const finalResults: ImportSummary = {
        ...validationResults!,
        imported,
        failed,
        errors: [...(validationResults?.errors || []), ...importErrors]
      };

      setValidationResults(finalResults);
      setImportStatus(`Importação concluída: ${imported} sucessos, ${failed} falhas`);
      setStep('complete');

      // Mostrar notificação de conclusão
      if (imported > 0 && failed === 0) {
        await showNotification(`Importação concluída com sucesso! ${imported} leads importados.`, 'success', 'Importação Concluída');
      } else if (imported > 0 && failed > 0) {
        await showNotification(`Importação parcialmente concluída: ${imported} leads importados, ${failed} falharam.`, 'warning', 'Importação Concluída');
      } else if (failed > 0) {
        await showNotification(`Importação falhou: ${failed} leads não puderam ser importados.`, 'error', 'Falha na Importação');
      }

      console.log('Importação finalizada:', finalResults);
      onImportComplete(finalResults);

    } catch (error: any) {
      console.error('Erro geral na importação:', error);
      setImportStatus('Erro durante a importação');

      await showNotification(`Erro durante a importação: ${error.message || 'Erro desconhecido'}`, 'error', 'Erro na Importação');
      setStep('preview');
    }
  };

  // Função para baixar template CSV
  const downloadTemplate = async () => {
    const headers = availableFields.map(f => f.label.replace(' *', ''));
    const csvContent = headers.join(',') + '\n' +
      'João Silva,joao@email.com,(11) 99999-9999,Empresa ABC,Gerente,Website,Interessado em automação,novo,morno,"Rua das Flores, 123",São Paulo,SP,01234-567,50000,2024-12-31,1';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_importacao_leads.csv';
    link.click();

    await showNotification('Template CSV baixado com sucesso!', 'success', 'Download Concluído');
  };

  const handleNext = async () => {
    if (step === 'mapping') {
      setImportStatus('Validando dados...');
      const validation = await validateData();
      setValidationResults(validation);
      setStep('preview');
    } else if (step === 'preview') {
      processImport();
    }
  };

  const handleBack = () => {
    if (step === 'mapping') {
      setStep('upload');
    } else if (step === 'preview') {
      setStep('mapping');
    }
  };

  // Função auxiliar para verificar se está importando
  const isImporting = step === 'importing';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col dark:bg-slate-900 dark:border dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 dark:text-gray-100">
            <Upload size={24} />
            Importar Leads via CSV
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-slate-800 dark:text-gray-400"
            disabled={isImporting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 dark:bg-blue-900/20">
                  <FileText size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  Selecione o arquivo CSV
                </h3>
                <p className="text-gray-600 mb-6 dark:text-gray-400">
                  Faça upload do arquivo CSV contendo os dados dos leads para importação
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors dark:border-slate-700 dark:hover:border-blue-500">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload size={48} className="mx-auto text-gray-400 mb-4 dark:text-gray-500" />
                <p className="text-lg font-medium text-gray-700 mb-2 dark:text-gray-200">
                  Clique para selecionar ou arraste o arquivo aqui
                </p>
                <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                  Apenas arquivos CSV são aceitos
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Selecionar Arquivo
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/10 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-blue-600 mt-0.5 dark:text-blue-400" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2 dark:text-blue-200">
                      Dicas para importação:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1 dark:text-blue-300">
                      <li>• <strong>Separadores suportados:</strong> vírgula (,) ou ponto e vírgula (;)</li>
                      <li>• <strong>Codificações suportadas:</strong> UTF-8, ISO-8859-1 (Latin-1), ASCII</li>
                      <li>• Campos obrigatórios: Nome, Empresa, Endereço, Cidade, Estado, CEP, Valor, Próximo Contato</li>
                      <li>• Formato de data: YYYY-MM-DD (ex: 2024-12-31)</li>
                      <li>• Estágios válidos: novo, contatado, reuniao, proposta, fechado, perdido</li>
                      <li>• Temperaturas válidas: frio, morno, quente</li>
                      <li>• Emails duplicados serão automaticamente rejeitados</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 mx-auto dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                >
                  <Download size={16} />
                  Baixar Template CSV
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Mapping */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  Mapeamento de Campos
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Associe as colunas do seu CSV aos campos do sistema
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>Arquivo:</strong> {csvData.length} linhas encontradas</p>
                  <p><strong>Separador:</strong> {detectedSeparator === ',' ? 'vírgula' : detectedSeparator === ';' ? 'ponto e vírgula' : detectedSeparator}</p>
                  <p><strong>Codificação:</strong> {detectedEncoding}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {csvHeaders.map(header => (
                  <div key={header} className="border rounded-lg p-4 dark:border-slate-800">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                      Coluna CSV: <strong>{header}</strong>
                    </label>
                    <select
                      value={fieldMappings[header] || ''}
                      onChange={(e) => setFieldMappings(prev => ({
                        ...prev,
                        [header]: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                    >
                      <option value="">Não mapear</option>
                      {availableFields.map(field => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && validationResults && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  Prévia da Importação
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Revise os dados antes de confirmar a importação
                </p>
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center dark:bg-blue-900/10 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {validationResults.total}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-300">Total</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center dark:bg-green-900/10 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {validationResults.valid}
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-300">Válidos</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center dark:bg-red-900/10 dark:border-red-800">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {validationResults.invalid}
                  </div>
                  <div className="text-sm text-red-800 dark:text-red-300">Inválidos</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center dark:bg-yellow-900/10 dark:border-yellow-800">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {validationResults.duplicates}
                  </div>
                  <div className="text-sm text-yellow-800 dark:text-yellow-300">Duplicados</div>
                </div>
              </div>

              {/* Alertas de duplicatas na base */}
              {duplicatesFromDB.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Emails já existentes na base de dados ({duplicatesFromDB.length})
                  </h4>
                  <div className="text-sm text-orange-800">
                    Os seguintes emails já existem e serão ignorados: {duplicatesFromDB.slice(0, 5).join(', ')}
                    {duplicatesFromDB.length > 5 && ` e mais ${duplicatesFromDB.length - 5}...`}
                  </div>
                </div>
              )}

              {/* Erros */}
              {validationResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Erros Encontrados ({validationResults.errors.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {validationResults.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-800 bg-red-100 rounded p-2">
                        <strong>Linha {error.row}:</strong> {error.message} em "{error.field}"
                        {error.value && <span className="text-red-600"> (valor: "{error.value}")</span>}
                      </div>
                    ))}
                    {validationResults.errors.length > 10 && (
                      <div className="text-sm text-red-600 text-center">
                        ... e mais {validationResults.errors.length - 10} erros
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview dos dados */}
              <div className="border rounded-lg dark:border-slate-800">
                <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-slate-950 dark:border-slate-800">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Prévia dos Dados
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                    >
                      {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showPreview ? 'Ocultar' : 'Mostrar'} Prévia
                    </button>
                    {showPreview && (
                      <select
                        value={previewRows}
                        onChange={(e) => setPreviewRows(parseInt(e.target.value))}
                        className="px-2 py-1 text-sm border border-gray-300 rounded dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200"
                      >
                        <option value={5}>5 linhas</option>
                        <option value={10}>10 linhas</option>
                        <option value={20}>20 linhas</option>
                      </select>
                    )}
                  </div>
                </div>

                {showPreview && (
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(fieldMappings).map(header => (
                            <th key={header} className="text-left p-2 font-medium text-gray-700 dark:text-gray-300">
                              {header}
                              <br />
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                → {availableFields.find(f => f.key === fieldMappings[header])?.label || 'Não mapeado'}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, previewRows).map((row, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                            {Object.keys(fieldMappings).map(header => (
                              <td key={header} className="p-2 text-gray-900 dark:text-gray-200">
                                {row[header] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Importing */}
          {step === 'importing' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <RefreshCw size={32} className="text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Importando Leads...
              </h3>
              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {Math.round(importProgress)}% concluído
                </p>
                {importStatus && (
                  <p className="text-xs text-gray-500 mt-1">
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && validationResults && (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Importação Concluída!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-xl font-bold text-green-600">
                    {validationResults.imported}
                  </div>
                  <div className="text-sm text-green-800">Importados</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-xl font-bold text-red-600">
                    {validationResults.failed}
                  </div>
                  <div className="text-sm text-red-800">Falharam</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-xl font-bold text-yellow-600">
                    {validationResults.duplicates}
                  </div>
                  <div className="text-sm text-yellow-800">Duplicados</div>
                </div>
              </div>

              {/* Mostrar erros de importação se houver */}
              {validationResults.failed > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                  <h4 className="font-medium text-red-900 mb-2">
                    Erros durante a importação:
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {validationResults.errors
                      .filter(e => e.field === 'Geral')
                      .slice(0, 5)
                      .map((error, index) => (
                        <div key={index} className="text-sm text-red-800">
                          <strong>Linha {error.row}:</strong> {error.message}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - FIXO */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0 dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {step !== 'upload' && step !== 'importing' && step !== 'complete' && (
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isImporting}
              >
                Voltar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 'complete' ? (
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Concluir
              </button>
            ) : step === 'preview' ? (
              <button
                onClick={handleNext}
                disabled={validationResults?.valid === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar {validationResults?.valid} Leads
              </button>
            ) : step === 'mapping' ? (
              <button
                onClick={handleNext}
                disabled={Object.keys(fieldMappings).length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validar Dados
              </button>
            ) : step === 'importing' ? (
              <button
                disabled
                className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                Importando...
              </button>
            ) : (
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadImportCSV;
