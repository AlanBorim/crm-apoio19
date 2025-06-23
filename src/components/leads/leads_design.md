# Design do Módulo de Gerenciamento de Leads - CRM Apoio19

## Visão Geral
O módulo de Gerenciamento de Leads permitirá aos usuários visualizar, filtrar, adicionar, editar e gerenciar leads de forma eficiente. O design seguirá o padrão visual do dashboard, inspirado no Monday.com com tons de laranja e layout clean.

## Estrutura do Módulo

### 1. Lista de Leads (LeadList)
- **Tabela/Grid Responsiva**
  - Colunas: Nome, Empresa, Telefone, Email, Status, Valor, Data de Criação
  - Ordenação por qualquer coluna
  - Paginação para grandes volumes de dados
  - Linhas clicáveis para visualização detalhada
  - Checkbox para seleção múltipla

- **Cabeçalho da Lista**
  - Título e contador de leads
  - Botão de adicionar novo lead
  - Botão de ações em lote (para itens selecionados)
  - Botão de exportar (CSV/Excel)

- **Barra de Filtros**
  - Campo de pesquisa global
  - Filtro por status (dropdown)
  - Filtro por data (range picker)
  - Filtro por valor (range slider)
  - Botão para limpar filtros

### 2. Formulário de Lead (LeadForm)
- **Modal/Drawer de Cadastro/Edição**
  - Campos para todas as informações do lead
  - Validação de campos obrigatórios
  - Máscaras para telefone, valores monetários, etc.
  - Botões de salvar e cancelar

- **Campos do Formulário**
  - Nome do contato (obrigatório)
  - Empresa (obrigatório)
  - Telefone
  - Email
  - Status (dropdown)
  - Valor estimado
  - Origem do lead
  - Descrição/Observações
  - Data de próximo contato

### 3. Visualização Detalhada (LeadDetail)
- **Cabeçalho**
  - Nome do lead e empresa
  - Status atual (com opção de alterar)
  - Botões de editar e excluir

- **Informações Principais**
  - Card com dados de contato
  - Card com informações financeiras
  - Card com datas importantes

- **Histórico de Interações**
  - Timeline de atividades
  - Registro de mudanças de status
  - Comentários/notas

- **Ações Disponíveis**
  - Adicionar comentário/nota
  - Agendar próxima interação
  - Enviar proposta
  - Mover para outra etapa do funil

### 4. Ações em Lote (BatchActions)
- **Menu de Ações**
  - Alterar status
  - Atribuir a usuário
  - Excluir selecionados
  - Exportar selecionados

### 5. Componentes Auxiliares
- **Filtros Avançados**
  - Componente expansível para filtros adicionais
  - Salvar filtros favoritos

- **Estatísticas Rápidas**
  - Mini-cards com métricas importantes
  - Total de leads por status
  - Valor total em negociação

## Adaptação por Perfil de Usuário

### Admin
- Acesso completo a todos os leads
- Visualização de todas as métricas e estatísticas
- Permissão para excluir leads

### Comercial
- Acesso aos seus próprios leads e leads compartilhados
- Visualização de métricas relacionadas aos seus leads
- Sem permissão para excluir leads (apenas marcar como inativos)

### Financeiro
- Visualização somente de leads em estágios avançados (proposta, fechado)
- Foco em informações financeiras
- Sem permissão para editar informações de contato

## Interatividade e Funcionalidades

- **Arrastar e Soltar**
  - Reordenar leads na lista
  - Mover leads entre status (estilo kanban)

- **Notificações**
  - Alertas para leads sem interação recente
  - Lembretes de próximos contatos agendados

- **Ações Rápidas**
  - Menu de contexto ao clicar com botão direito
  - Botões de ação rápida ao passar o mouse

## Paleta de Cores
Seguirá a mesma paleta do dashboard:

- **Primária**: Laranja (#FF6B00) - Elementos de destaque, botões principais
- **Secundária**: Azul (#0073EA) - Elementos informativos, links
- **Status de Leads**:
  - Novo: Azul claro (#0086C0)
  - Contatado: Amarelo (#FFCB00)
  - Qualificado: Roxo (#784BD1)
  - Proposta: Laranja (#FF6B00)
  - Fechado: Verde (#00C875)
  - Perdido: Cinza (#676879)

## Responsividade

- **Desktop**: Visualização completa em tabela com todas as colunas
- **Tablet**: Tabela simplificada com colunas principais
- **Mobile**: 
  - Lista de cards em vez de tabela
  - Filtros em menu expansível
  - Formulários em tela cheia
