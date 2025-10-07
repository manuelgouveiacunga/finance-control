import { Wallet, TrendingUp, TrendingDown, PieChart, Clock, Trash2, Sun, Moon, User } from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { NewTransactionDialog } from '../components/NewTransactionDialog';
import { ModalCanceledTransaction } from '../components/ModalCanceledTransaction';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
  Cell
} from 'recharts';

function FinanceDashboard() {
  const { transactions, removeTransaction } = useTransactions();
  const { currentUser, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = Math.abs(transactions
    .filter(t => t.amount < 0)
    .reduce((acc, curr) => acc + curr.amount, 0));

  // Preparar dados para o gráfico de barras (últimos 30 dias)
  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('pt-BR');
      days.push({ date: dateString, income: 0, expenses: 0 });
    }
    
    return days;
  };

  const prepareChartData = () => {
    const days = getLast30Days();
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionDateString = transactionDate.toLocaleDateString('pt-BR');
      
      const dayIndex = days.findIndex(day => day.date === transactionDateString);
      if (dayIndex !== -1) {
        if (transaction.amount > 0) {
          days[dayIndex].income += transaction.amount;
        } else {
          days[dayIndex].expenses += Math.abs(transaction.amount);
        }
      }
    });
    
    return days;
  };

  // Preparar dados para o gráfico de pizza (categorias)
  const preparePieData = () => {
    const categories = {};
    
    transactions.forEach(transaction => {
      if (transaction.amount < 0) {
        const category = transaction.category || 'Outros';
        categories[category] = (categories[category] || 0) + Math.abs(transaction.amount);
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      removeTransaction(transactionToDelete.id);
      setIsModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTransactionToDelete(null);
  };
  
  const handleLogout = () => {
    logout();
  };

  const chartData = prepareChartData();
  const pieData = preparePieData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 transition-all duration-300">
        
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-gray-800 dark:via-slate-800 dark:to-gray-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Controlo Financeiro
                </h1>
                <p className="text-blue-100 dark:text-gray-300 text-sm mt-1">
                  Gerencie suas finanças com inteligência
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span className="text-sm sm:text-base">{currentUser?.name || currentUser?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 text-sm sm:text-base"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 -mt-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Saldo Total
              </CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Kz {totalBalance.toLocaleString('pt-BR')}
              </div>
              <div className={`text-sm font-medium ${totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {totalBalance >= 0 ? '↗ Positivo' : '↘ Negativo'}
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Receitas
              </CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Kz {totalIncome.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                +{transactions.filter(t => t.amount > 0).length} transações
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Despesas
              </CardTitle>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Kz {totalExpenses.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400">
                -{transactions.filter(t => t.amount < 0).length} transações
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center space-x-2">
                <span>Fluxo de Caixa - Últimos 30 dias</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`Kz ${value.toLocaleString('pt-BR')}`, '']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
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
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <CardTitle className="dark:text-white text-xl font-bold">Transações Recentes</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {transactions.length} transações registradas
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <NewTransactionDialog />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {transactions.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Wallet className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Nenhuma transação encontrada</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Adicione sua primeira transação</p>
                    </div>
                  ) : (
                    transactions.map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className={`group p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                          index === 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${
                              transaction.amount > 0
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {transaction.amount > 0
                                ? <TrendingUp className="h-5 w-5" />
                                : <TrendingDown className="h-5 w-5" />
                              }
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-lg">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(transaction.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <span className={`text-xl font-bold ${
                                transaction.amount > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {transaction.amount > 0 ? '+' : '-'}
                                {Math.abs(transaction.amount).toLocaleString('pt-BR')} Kz
                              </span>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {transaction.amount > 0 ? 'Receita' : 'Despesa'}
                              </p>
                            </div>
                            {/* Botão de deletar - corrigido */}
                            <button
                              onClick={() => handleDeleteClick(transaction)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-all duration-200 opacity-70 hover:opacity-100"
                              title="Deletar transação"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-white flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Distribuição</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Despesas</span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Economia</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${totalIncome > 0 ? (totalBalance / totalIncome) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-sm border-0 shadow-lg bg-white/70">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-white">Metas</CardTitle>
                <Clock className="h-4 w-4 text-primary-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Economia mensal</span>
                      <span className="font-medium">
                        {totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${totalIncome > 0 ? (totalBalance / totalIncome) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ModalCanceledTransaction
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        transaction={transactionToDelete}
      />
    </div>
  );
}

export default FinanceDashboard;