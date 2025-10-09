# Funcionalidade de Relatórios Financeiros

## Visão Geral
A nova funcionalidade de relatórios oferece uma análise completa e profissional das movimentações financeiras do usuário, com possibilidade de exportação em PDF.

## Funcionalidades Implementadas

### 1. Filtros Avançados
- **Filtro por Data**: Selecione um período específico (data inicial e final)
- **Tipo de Transação**: Filtre por receitas, despesas ou todas as transações
- **Categoria**: Filtre por categorias específicas de despesas
- **Intervalo de Valores**: Defina valores mínimo e máximo para as transações

### 2. Análises Financeiras
- **Saldo Total**: Valor atual do saldo baseado nas transações filtradas
- **Total de Receitas**: Soma de todas as receitas no período
- **Total de Despesas**: Soma de todas as despesas no período
- **Taxa de Poupança**: Percentual de economia em relação às receitas
- **Médias**: Receita média e despesa média por transação
- **Estatísticas**: Número total de transações e categorias ativas

### 3. Visualizações Gráficas
- **Gráfico de Fluxo Mensal**: Barras mostrando receitas e despesas por mês
- **Gráfico de Pizza**: Distribuição das despesas por categoria
- **Estatísticas Detalhadas**: Cards com informações resumidas

### 4. Exportação para PDF
- **Relatório Completo**: Inclui resumo financeiro, distribuição de despesas e lista de transações
- **Formatação Profissional**: Layout limpo e organizado
- **Informações do Usuário**: Cabeçalho com dados do usuário e período do relatório
- **Download Automático**: Arquivo salvo automaticamente com nome baseado na data

## Como Usar

### Acessando os Relatórios
1. No dashboard principal, clique no botão "Relatórios" no cabeçalho
2. Você será redirecionado para a página de relatórios

### Aplicando Filtros
1. Use o painel de filtros à esquerda para refinar os dados
2. Os gráficos e estatísticas são atualizados automaticamente
3. Use "Limpar Filtros" para resetar todas as configurações

### Exportando PDF
1. Configure os filtros desejados
2. Clique no botão "Exportar PDF" no cabeçalho
3. O arquivo será gerado e baixado automaticamente

## Estrutura dos Arquivos

### Componentes Criados
- `src/components/ReportFilters.jsx` - Componente de filtros
- `src/pages/ReportsPage.jsx` - Página principal de relatórios

### Dependências Adicionadas
- `jspdf` - Geração de arquivos PDF
- `html2canvas` - Captura de elementos HTML (não utilizado na versão atual)
- `date-fns` - Manipulação de datas

### Rotas Adicionadas
- `/reports` - Página de relatórios (protegida por autenticação)

## Recursos Técnicos

### Cálculos Implementados
- Saldo total baseado na soma de todas as transações
- Separação automática entre receitas (valores positivos) e despesas (valores negativos)
- Cálculo de médias por tipo de transação
- Taxa de poupança como percentual das receitas
- Agrupamento de despesas por categoria

### Filtros Aplicados
- Filtro por intervalo de datas usando `date-fns`
- Filtro por tipo de transação (receita/despesa)
- Filtro por categoria (apenas para despesas)
- Filtro por intervalo de valores (mínimo e máximo)

### Geração de PDF
- Cabeçalho com informações do usuário e período
- Resumo financeiro com todos os indicadores
- Distribuição de despesas por categoria
- Lista detalhada de transações (limitada a 50 para performance)
- Formatação profissional com cores e layout organizado

## Navegação
- Botão "Voltar" para retornar ao dashboard
- Integração completa com o sistema de autenticação
- Responsivo para diferentes tamanhos de tela

A funcionalidade está totalmente integrada ao sistema existente e mantém a consistência visual com o resto da aplicação.