# Design do Dashboard Inicial - CRM Apoio19

## Visão Geral
O Dashboard Inicial será a página principal do CRM após o login, fornecendo uma visão consolidada das informações mais importantes para o usuário. O design seguirá o estilo visual do Monday.com com tons de laranja e layout clean, conforme definido no plano estratégico.

## Estrutura do Layout

### 1. Layout Principal
- **Sidebar de Navegação (Esquerda)**
  - Logo do CRM Apoio19
  - Menu de navegação principal
  - Perfil do usuário (nome, avatar, cargo)
  - Opções de configuração e logout

- **Área de Conteúdo Principal (Centro/Direita)**
  - Cabeçalho com título da página e ações rápidas
  - Área de conteúdo dinâmico (cards, gráficos, listas)
  - Rodapé com informações de versão/copyright

### 2. Componentes do Dashboard

#### Cards de Resumo (Primeira Linha)
- **Card de Leads**
  - Total de leads
  - Novos leads (hoje/esta semana)
  - Comparativo com período anterior (%)
  - Ícone e cor representativa

- **Card de Propostas**
  - Total de propostas
  - Propostas pendentes
  - Valor total em negociação
  - Ícone e cor representativa

- **Card de Tarefas**
  - Total de tarefas
  - Tarefas pendentes/atrasadas
  - Tarefas concluídas hoje
  - Ícone e cor representativa

- **Card de Faturamento** (visível apenas para Admin e Financeiro)
  - Faturamento do mês
  - Comparativo com mês anterior (%)
  - Meta mensal e progresso
  - Ícone e cor representativa

#### Gráficos de Desempenho (Segunda Linha)
- **Gráfico de Funil de Vendas**
  - Visualização do funil com etapas do processo
  - Quantidade de leads em cada etapa
  - Percentual de conversão entre etapas

- **Gráfico de Desempenho Mensal**
  - Linha/barras mostrando leads e propostas por mês
  - Comparativo com metas estabelecidas
  - Opção para filtrar por período

#### Atividades e Tarefas (Terceira Linha)
- **Lista de Atividades Recentes**
  - Últimas interações com leads/clientes
  - Propostas enviadas/atualizadas
  - Tarefas concluídas
  - Filtro por tipo de atividade

- **Tarefas Pendentes**
  - Lista de tarefas do usuário
  - Ordenadas por prazo/prioridade
  - Opção para marcar como concluída
  - Link para visualização completa no Kanban

## Adaptação por Perfil de Usuário

### Admin
- Acesso a todos os componentes
- Visibilidade de métricas financeiras
- Desempenho geral da equipe

### Comercial
- Foco em leads e propostas
- Suas próprias tarefas e atividades
- Sem acesso a métricas financeiras detalhadas

### Financeiro
- Foco em propostas aprovadas e faturamento
- Métricas financeiras detalhadas
- Visibilidade limitada de leads em estágio inicial

## Interatividade e Funcionalidades

- Cards clicáveis que levam às respectivas seções
- Gráficos interativos com tooltips de detalhamento
- Filtros de período (hoje, semana, mês, trimestre)
- Atualização em tempo real ou com botão de refresh
- Notificações para eventos importantes

## Paleta de Cores

- **Primária**: Laranja (#FF6B00) - Elementos de destaque, botões principais
- **Secundária**: Azul (#0073EA) - Elementos informativos, links
- **Sucesso**: Verde (#00C875) - Indicadores positivos, conclusões
- **Alerta**: Amarelo (#FFCB00) - Avisos, pendências
- **Erro**: Vermelho (#E2445C) - Problemas, atrasos
- **Neutros**: Branco (#FFFFFF), Cinza claro (#F5F6F8), Cinza médio (#676879), Cinza escuro (#323338)

## Responsividade

- Layout adaptável para desktop, tablet e mobile
- Em telas menores, os cards empilham verticalmente
- Sidebar se transforma em menu hambúrguer em mobile
- Gráficos simplificados em visualização mobile
