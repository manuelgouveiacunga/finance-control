import { useState, useMemo } from 'react';
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
  ArrowLeft
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

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246); // blue-600
      pdf.text('Relatório Financeiro', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, 30, { align: 'center' });
      pdf.text(`Usuário: ${currentUser?.name || currentUser?.email}`, pageWidth / 2, 37, { align: 'center' });
      
      let periodText = 'Período: ';
      if (filters.startDate && filters.endDate) {
        periodText += `${format(parseISO(filters.startDate), 'dd/MM/yyyy')} - ${format(parseISO(filters.endDate), 'dd/MM/yyyy')}`;
      } else if (filters.startDate) {
        periodText += `A partir de ${format(parseISO(filters.startDate), 'dd/MM/yyyy')}`;
      } else if (filters.endDate) {
        periodText += `Até ${format(parseISO(filters.endDate), 'dd/MM/yyyy')}`;
      } else {
        periodText += 'Todas as transações';
      }
      pdf.text(periodText, pageWidth / 2, 44, { align: 'center' });
      
      let yPosition = 60;
      
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Resumo Financeiro', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(75, 85, 99);
      
      const summaryData = [
        ['Saldo Total:', `Kz ${financialSummary.totalBalance.toLocaleString('pt-BR')}`],
        ['Total de Receitas:', `Kz ${financialSummary.totalIncome.toLocaleString('pt-BR')}`],
        ['Total de Despesas:', `Kz ${financialSummary.totalExpenses.toLocaleString('pt-BR')}`],
        ['Número de Receitas:', `${financialSummary.incomeTransactions} transações`],
        ['Número de Despesas:', `${financialSummary.expenseTransactions} transações`],
        ['Receita Média:', `Kz ${financialSummary.averageIncome.toLocaleString('pt-BR')}`],
        ['Despesa Média:', `Kz ${financialSummary.averageExpense.toLocaleString('pt-BR')}`],
        ['Taxa de Poupança:', `${financialSummary.savingsRate.toFixed(1)}%`]
      ];
      
      summaryData.forEach(([label, value]) => {
        pdf.text(label, 25, yPosition);
        pdf.text(value, 120, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      if (expenseDistribution.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Distribuição de Despesas por Categoria', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        
        expenseDistribution.forEach(category => {
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
      
      filteredTransactions.slice(0, 50).forEach(transaction => {
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
      
      if (filteredTransactions.length > 50) {
        yPosition += 5;
        pdf.setTextColor(107, 114, 128);
        pdf.text(`... e mais ${filteredTransactions.length - 50} transações`, 25, yPosition);
      }
      
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Relatório gerado pelo Sistema de Controlo Financeiro', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      const fileName = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 transition-all duration-300">
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
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-2 px-6 py-3 bg-white/10 rounded-lg backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              <span>{isGeneratingPDF ? 'Gerando...' : 'Exportar PDF'}</span>
            </button>
          </div>
        </div>
      </header>

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
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
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
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
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
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
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Taxa de Poupança
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {financialSummary.savingsRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
                    <span>Fluxo Mensal</span>
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
                    <span>Distribuição de Despesas</span>
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
                <CardTitle className="dark:text-white">Estatísticas Detalhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      Kz {financialSummary.averageIncome.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Receita Média</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      Kz {financialSummary.averageExpense.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Despesa Média</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {filteredTransactions.length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total de Transações</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {expenseDistribution.length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Categorias Ativas</p>
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