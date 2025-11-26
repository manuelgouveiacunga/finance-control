import { useState, useMemo, useRef } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { ReportFilters } from '../components/ReportFilters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart,
  BarChart3,
  Calendar,
  ArrowLeft,
  Eye,
  X,
  Check
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

function ReportsPage() {
  const { transactions } = useTransactions();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    transactionType: 'all',
    minAmount: '',
    maxAmount: '',
    category: 'all'
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const pdfPreviewRef = useRef();

  // Filtrar transações baseado nos filtros aplicados
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filtro por data
      if (filters.startDate || filters.endDate) {
        const transactionDate = new Date(transaction.date);
        
        if (filters.startDate && filters.endDate) {
          const start = parseISO(filters.startDate);
          const end = parseISO(filters.endDate);
          if (!isWithinInterval(transactionDate, { start, end })) {
            return false;
          }
        } else if (filters.startDate) {
          const start = parseISO(filters.startDate);
          if (transactionDate < start) return false;
        } else if (filters.endDate) {
          const end = parseISO(filters.endDate);
          if (transactionDate > end) return false;
        }
      }

      // Filtro por tipo de transação
      if (filters.transactionType !== 'all') {
        if (filters.transactionType === 'income' && transaction.amount <= 0) return false;
        if (filters.transactionType === 'expense' && transaction.amount >= 0) return false;
      }

      // Filtro por categoria
      if (filters.category !== 'all' && transaction.category !== filters.category) {
        return false;
      }

      // Filtro por valor
      const absAmount = Math.abs(transaction.amount);
      if (filters.minAmount && absAmount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && absAmount > parseFloat(filters.maxAmount)) return false;

      return true;
    });
  }, [transactions, filters]);

  const financialSummary = useMemo(() => {
    const totalBalance = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = Math.abs(filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, curr) => acc + curr.amount, 0));
    
    const incomeTransactions = filteredTransactions.filter(t => t.amount > 0).length;
    const expenseTransactions = filteredTransactions.filter(t => t.amount < 0).length;
    
    const averageIncome = incomeTransactions > 0 ? totalIncome / incomeTransactions : 0;
    const averageExpense = expenseTransactions > 0 ? totalExpenses / expenseTransactions : 0;

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      incomeTransactions,
      expenseTransactions,
      averageIncome,
      averageExpense,
      savingsRate: totalIncome > 0 ? ((totalBalance / totalIncome) * 100) : 0
    };
  }, [filteredTransactions]);

  const expenseDistribution = useMemo(() => {
    const categories = {};
    
    filteredTransactions.forEach(transaction => {
      if (transaction.amount < 0) {
        const category = transaction.category || 'Outros';
        categories[category] = (categories[category] || 0) + Math.abs(transaction.amount);
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      percentage: financialSummary.totalExpenses > 0 ? ((value / financialSummary.totalExpenses) * 100).toFixed(1) : 0
    }));
  }, [filteredTransactions, financialSummary.totalExpenses]);

  const monthlyFlow = useMemo(() => {
    const monthlyData = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy', { locale: ptBR });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          income: 0,
          expenses: 0,
          balance: 0
        };
      }
      
      if (transaction.amount > 0) {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(transaction.amount);
      }
      
      monthlyData[monthKey].balance = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  const generatePDFData = () => {
    return {
      title: 'Relatório Financeiro - KitandiHub',
      generatedAt: format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      user: currentUser?.name || currentUser?.email,
      period: getPeriodText(),
      financialSummary,
      expenseDistribution,
      transactions: filteredTransactions.slice(0, 50),
      totalTransactions: filteredTransactions.length
    };
  };

  const getPeriodText = () => {
    if (filters.startDate && filters.endDate) {
      return `${format(parseISO(filters.startDate), 'dd/MM/yyyy')} - ${format(parseISO(filters.endDate), 'dd/MM/yyyy')}`;
    } else if (filters.startDate) {
      return `A partir de ${format(parseISO(filters.startDate), 'dd/MM/yyyy')}`;
    } else if (filters.endDate) {
      return `Até ${format(parseISO(filters.endDate), 'dd/MM/yyyy')}`;
    } else {
      return 'Todas as transações';
    }
  };

  const previewPDF = () => {
    const data = generatePDFData();
    setPdfData(data);
    setShowPDFPreview(true);
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Relatório Financeiro', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Gerado em: ${pdfData.generatedAt}`, pageWidth / 2, 30, { align: 'center' });
      pdf.text(`Usuário: ${pdfData.user}`, pageWidth / 2, 37, { align: 'center' });
      pdf.text(`Período: ${pdfData.period}`, pageWidth / 2, 44, { align: 'center' });
      
      let yPosition = 60;
      
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Resumo Financeiro', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(75, 85, 99);
      
      const summaryData = [
        ['Saldo Total:', `Kz ${pdfData.financialSummary.totalBalance.toLocaleString('pt-BR')}`],
        ['Total de Receitas:', `Kz ${pdfData.financialSummary.totalIncome.toLocaleString('pt-BR')}`],
        ['Total de Despesas:', `Kz ${pdfData.financialSummary.totalExpenses.toLocaleString('pt-BR')}`],
        ['Número de Receitas:', `${pdfData.financialSummary.incomeTransactions} transações`],
        ['Número de Despesas:', `${pdfData.financialSummary.expenseTransactions} transações`],
        ['Receita Média:', `Kz ${pdfData.financialSummary.averageIncome.toLocaleString('pt-BR')}`],
        ['Despesa Média:', `Kz ${pdfData.financialSummary.averageExpense.toLocaleString('pt-BR')}`],
        ['Taxa de Poupança:', `${pdfData.financialSummary.savingsRate.toFixed(1)}%`]
      ];
      
      summaryData.forEach(([label, value]) => {
        pdf.text(label, 25, yPosition);
        pdf.text(value, 120, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      if (pdfData.expenseDistribution.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Distribuição de Despesas por Categoria', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        
        pdfData.expenseDistribution.forEach(category => {
          pdf.text(`${category.name}:`, 25, yPosition);
          pdf.text(`Kz ${category.value.toLocaleString('pt-BR')} (${category.percentage}%)`, 120, yPosition);
          yPosition += 8;
        });
        
        yPosition += 10;
      }

      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Transações Detalhadas', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      
      pdf.text('Data', 25, yPosition);
      pdf.text('Descrição', 55, yPosition);
      pdf.text('Categoria', 120, yPosition);
      pdf.text('Valor', 160, yPosition);
      yPosition += 8;

      pdf.line(20, yPosition - 2, pageWidth - 20, yPosition - 2);
      yPosition += 5;
      
      pdfData.transactions.forEach(transaction => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const date = format(new Date(transaction.date), 'dd/MM/yyyy');
        const description = transaction.description.length > 25 ? 
          transaction.description.substring(0, 25) + '...' : 
          transaction.description;
        const category = transaction.category || 'N/A';
        const amount = `${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString('pt-BR')} Kz`;
        
        pdf.text(date, 25, yPosition);
        pdf.text(description, 55, yPosition);
        pdf.text(category, 120, yPosition);

        if (transaction.amount > 0) {
          pdf.setTextColor(34, 197, 94); 
        } else {
          pdf.setTextColor(239, 68, 68);
        }
        pdf.text(amount, 160, yPosition);
        pdf.setTextColor(75, 85, 99);
        
        yPosition += 7;
      });
      
      if (pdfData.totalTransactions > 50) {
        yPosition += 5;
        pdf.setTextColor(107, 114, 128);
        pdf.text(`... e mais ${pdfData.totalTransactions - 50} transações`, 25, yPosition);
      }
      
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Relatório gerado pela KitadiHub - Controlo Financeiro', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      const fileName = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      pdf.save(fileName);
      
      setShowPDFPreview(false);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 transition-all duration-300 pt-14">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-gray-800 dark:via-slate-800 dark:to-gray-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 bg-white/10 rounded-lg backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Relatórios Financeiros
                </h1>
                <p className="text-blue-100 dark:text-gray-300 text-sm mt-1">
                  Análise detalhada das suas movimentações
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={previewPDF}
                disabled={isGeneratingPDF || filteredTransactions.length === 0}
                className="flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 bg-white/10 rounded-lg backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Visualizar PDF</span>
                <span className="sm:hidden">Visualizar</span>
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF || filteredTransactions.length === 0}
                className="flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 bg-white/10 rounded-lg backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Exportar PDF</span>
                <span className="sm:hidden">Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PDF Preview Modal */}
      {showPDFPreview && pdfData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-700 shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Pré-visualização do Relatório
              </h2>
              <button
                onClick={() => setShowPDFPreview(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <div ref={pdfPreviewRef} className="bg-white dark:bg-gray-900 p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 rounded-lg min-w-0">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {pdfData.title}
                  </h1>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    Gerado em: {pdfData.generatedAt}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    Usuário: {pdfData.user}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    Período: {pdfData.period}
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">
                    Resumo Financeiro
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-200">Saldo Total:</span>
                      <span className="font-medium text-gray-900 dark:text-white">Kz {pdfData.financialSummary.totalBalance.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-200">Total de Receitas:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Kz {pdfData.financialSummary.totalIncome.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-200">Total de Despesas:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">Kz {pdfData.financialSummary.totalExpenses.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-200">Número de Receitas:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{pdfData.financialSummary.incomeTransactions} transações</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-200">Número de Despesas:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{pdfData.financialSummary.expenseTransactions} transações</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-200">Receita Média:</span>
                      <span className="font-medium text-gray-900 dark:text-white">Kz {pdfData.financialSummary.averageIncome.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-200">Despesa Média:</span>
                      <span className="font-medium text-gray-900 dark:text-white">Kz {pdfData.financialSummary.averageExpense.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-200">Taxa de Poupança:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{pdfData.financialSummary.savingsRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Expense Distribution */}
                {pdfData.expenseDistribution.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">
                      Distribuição de Despesas por Categoria
                    </h2>
                    <div className="space-y-2 text-xs sm:text-sm">
                      {pdfData.expenseDistribution.map((category, index) => (
                        <div key={category.name} className="flex justify-between items-center">
                          <div className="flex items-center min-w-0 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full mr-2 shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-gray-800 dark:text-gray-200 truncate">{category.name}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white shrink-0 ml-2">
                            Kz {category.value.toLocaleString('pt-BR')} ({category.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transactions */}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">
                    Transações Detalhadas
                  </h2>
                  <div className="text-xs sm:text-sm overflow-x-auto">
                    <div className="min-w-[500px]">
                      {/* Header Row */}
                      <div className="grid grid-cols-12 gap-1 sm:gap-2 font-medium border-b pb-2 mb-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                        <div className="col-span-3">Data</div>
                        <div className="col-span-4">Descrição</div>
                        <div className="col-span-3">Categoria</div>
                        <div className="col-span-2 text-right">Valor</div>
                      </div>
                      
                      {/* Transactions Rows */}
                      {pdfData.transactions.map((transaction, index) => (
                        <div key={index} className="grid grid-cols-12 gap-1 sm:gap-2 py-1 border-b border-gray-100 dark:border-gray-800">
                          <div className="col-span-3 text-xs text-gray-800 dark:text-gray-200">
                            {format(new Date(transaction.date), 'dd/MM/yyyy')}
                          </div>
                          <div className="col-span-4 truncate text-gray-800 dark:text-gray-200">
                            {transaction.description.length > 20 
                              ? transaction.description.substring(0, 20) + '...'
                              : transaction.description
                            }
                          </div>
                          <div className="col-span-3 truncate text-gray-800 dark:text-gray-200">
                            {transaction.category || 'N/A'}
                          </div>
                          <div className={`col-span-2 text-right font-medium text-xs ${
                            transaction.amount > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('pt-BR')} Kz
                          </div>
                        </div>
                      ))}
                      
                      {pdfData.totalTransactions > 50 && (
                        <div className="text-center text-gray-600 dark:text-gray-400 mt-3 text-xs">
                          ... e mais {pdfData.totalTransactions - 50} transações
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-600 dark:text-gray-400">
                  Relatório gerado pela KitadiHub - Controlo Financeiro
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 border-t dark:border-gray-700 shrink-0">
              <button
                onClick={() => setShowPDFPreview(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                <Check className="h-4 w-4" />
                <span>{isGeneratingPDF ? 'Gerando...' : 'Confirmar e Exportar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <ReportFilters 
              onFiltersChange={setFilters} 
              transactions={transactions}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            {/* ... (resto do conteúdo permanece igual) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Saldo Total
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Kz {financialSummary.totalBalance.toLocaleString('pt-BR')}
                  </div>
                  <p className={`text-xs ${financialSummary.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {financialSummary.totalBalance >= 0 ? '↗ Positivo' : '↘ Negativo'}
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Receitas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Kz {financialSummary.totalIncome.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {financialSummary.incomeTransactions} transações
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Despesas
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Kz {financialSummary.totalExpenses.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {financialSummary.expenseTransactions} transações
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Taxa de Poupança
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {financialSummary.savingsRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Do total de receitas
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-900 dark:text-white">Fluxo Mensal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyFlow}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`Kz ${value.toLocaleString('pt-BR')}`, '']} />
                      <Legend />
                      <Bar dataKey="income" name="Receitas" fill="#10B981" />
                      <Bar dataKey="expenses" name="Despesas" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-900 dark:text-white">Distribuição de Despesas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={expenseDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {expenseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Kz ${value.toLocaleString('pt-BR')}`} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Estatísticas Detalhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      Kz {financialSummary.averageIncome.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Receita Média</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      Kz {financialSummary.averageExpense.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Despesa Média</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {filteredTransactions.length}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Total de Transações</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {expenseDistribution.length}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Categorias Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReportsPage;