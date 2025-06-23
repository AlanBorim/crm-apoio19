# Design do Módulo Kanban - CRM Apoio19

## Visão Geral
O módulo Kanban será uma ferramenta visual para gerenciar o fluxo de trabalho no CRM Apoio19, permitindo aos usuários visualizar e mover tarefas/leads entre diferentes estágios do processo. O design seguirá o padrão visual estabelecido (inspirado no Monday.com com tons de laranja).

## Componentes Principais

### 1. KanbanBoard
- Componente principal que contém toda a lógica do quadro
- Gerencia o estado global do quadro (colunas, cards, filtros)
- Implementa a funcionalidade de arrastar e soltar

### 2. KanbanColumn
- Representa uma coluna do quadro (ex: "Novo", "Em Progresso", "Concluído")
- Exibe título, contador de cards e opções da coluna
- Permite adicionar novos cards
- Aceita cards arrastados de outras colunas

### 3. KanbanCard
- Representa uma tarefa ou lead no quadro
- Exibe informações resumidas (título, responsável, data, prioridade)
- Permite ações rápidas (editar, excluir, mover)
- Pode ser arrastado entre colunas

### 4. KanbanFilter
- Permite filtrar cards por diversos critérios (responsável, prioridade, data)
- Inclui campo de pesquisa por texto
- Exibe contadores de cards filtrados

### 5. KanbanCardDetail
- Modal para visualizar/editar detalhes de um card
- Exibe todas as informações do card
- Permite adicionar comentários e anexos
- Oferece opções para editar propriedades do card

## Funcionalidades

### Arrastar e Soltar
- Mover cards entre colunas
- Reordenar cards dentro da mesma coluna
- Reordenar colunas no quadro

### Personalização
- Adicionar/editar/remover colunas
- Personalizar cores das colunas
- Definir limites de cards por coluna (opcional)

### Filtros e Visualização
- Filtrar por responsável, prioridade, data
- Pesquisar por texto em títulos e descrições
- Alternar entre visualizações (compacta/detalhada)

### Gerenciamento de Cards
- Criar novos cards
- Editar cards existentes
- Mover cards entre colunas
- Arquivar/excluir cards

## Estrutura de Dados

### Coluna (KanbanColumn)
```typescript
interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  cardIds: string[];
  color?: string;
  limit?: number;
}
```

### Card (KanbanCard)
```typescript
interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  createdAt: string;
  dueDate?: string;
  priority: 'baixa' | 'media' | 'alta';
  responsavel?: {
    id: string;
    nome: string;
  };
  tags?: string[];
  attachments?: number;
  comments?: number;
}
```

## Interações com API

### Endpoints Necessários
- `GET /api/kanban/columns` - Obter todas as colunas
- `GET /api/kanban/cards` - Obter todos os cards
- `POST /api/kanban/columns` - Criar nova coluna
- `PUT /api/kanban/columns/{id}` - Atualizar coluna
- `DELETE /api/kanban/columns/{id}` - Excluir coluna
- `POST /api/kanban/cards` - Criar novo card
- `PUT /api/kanban/cards/{id}` - Atualizar card
- `DELETE /api/kanban/cards/{id}` - Excluir card
- `PUT /api/kanban/cards/{id}/move` - Mover card entre colunas

## Responsividade
- Desktop: Exibição completa com todas as colunas lado a lado
- Tablet: Colunas com largura reduzida, scroll horizontal
- Mobile: Visualização de uma coluna por vez, com navegação entre colunas

## Considerações de Performance
- Carregamento lazy de cards para quadros grandes
- Otimização de operações de arrastar e soltar
- Cache local de dados para operações offline (opcional)
