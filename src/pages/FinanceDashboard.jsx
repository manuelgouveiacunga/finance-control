import { Wallet, TrendingUp, TrendingDown, PieChart,Clock } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { NewTransactionDialog } from '../components/NewTransactionDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
  
  function FinanceDashboard() {
    const { transactions } = useTransactions();
  
    const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((acc, curr) => acc + curr.amount, 0));
  
    return (
      <div className="min-h-screen bg-gray-50">
        
        <header className="bg-primary-600 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-white text-center">Controlo - Financeiro</h1>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-6 -mt-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Saldo Total
                </CardTitle>
                <Wallet className="h-4 w-4 text-primary-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  Kz {totalBalance.toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
  
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Receitas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  Kz {totalIncome.toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
  
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Despesas
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  Kz {totalExpenses.toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Transações Recentes</CardTitle>
                  <NewTransactionDialog />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map(transaction => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            transaction.amount > 0
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.amount > 0
                              ? <TrendingUp className="h-4 w-4" />
                              : <TrendingDown className="h-4 w-4" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <span className={`font-medium ${
                          transaction.amount > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : '-'}
                          {Math.abs(transaction.amount).toLocaleString('pt-BR')}  Kz
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
  
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Distribuição</CardTitle>
                  <PieChart className="h-4 w-4 text-primary-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 text-gray-500">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Despesas</span>
                        <span>{((totalExpenses / totalIncome) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${(totalExpenses / totalIncome) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Metas</CardTitle>
                  <Clock className="h-4 w-4 text-primary-600" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Economia mensal</span>
                        <span className="font-medium">
                          {((totalBalance / totalIncome) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(totalBalance / totalIncome) * 100}%` }}
                        ></div>
                      </div>
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
  
  export default FinanceDashboard;