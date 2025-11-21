import React, { useState } from 'react';
import { Plus, Target, Calendar, Wallet, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useGoals } from '../context/GoalsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const GoalsPage = () => {
  const { transactions } = useTransactions();
  const { goals, addGoal, removeGoal } = useGoals();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    type: 'savings',
    deadline: '',
    description: ''
  });

  
  const calculateGoalProgress = (goal) => {
    let currentAmount = 0;
    
    switch (goal.type) {
      case 'savings':
        currentAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        break;
      
      case 'spending_limit':
        currentAmount = Math.abs(transactions
          .filter(t => t.amount < 0)
          .reduce((acc, curr) => acc + curr.amount, 0));
        break;
      
      case 'income_target':
        currentAmount = transactions
          .filter(t => t.amount > 0)
          .reduce((acc, curr) => acc + curr.amount, 0);
        break;
      
      default:
        currentAmount = 0;
    }

    const progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
    const isCompleted = progress >= 100;
    const remaining = goal.targetAmount - currentAmount;

    return {
      currentAmount,
      progress: Math.min(progress, 100),
      isCompleted,
      remaining: Math.max(remaining, 0)
    };
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    
    if (!newGoal.targetAmount || parseFloat(newGoal.targetAmount) <= 0) {
      addToast('Por favor, insira um valor válido para a meta.', 'error');
      return;
    }

    const goal = {
      name: newGoal.name,
      description: newGoal.description,
      targetAmount: parseFloat(newGoal.targetAmount),
      type: newGoal.type,
      deadline: newGoal.deadline,
      completed: false
    };

    addGoal(goal);
    
    
    addToast(
      `Meta "${newGoal.name}" criada com sucesso! 🎯`, 
      'success'
    );
    
    setNewGoal({
      name: '',
      targetAmount: '',
      type: 'savings',
      deadline: '',
      description: ''
    });
    setIsCreateModalOpen(false);
  };

  const handleDeleteGoal = (goalId) => {
    const goalToDelete = goals.find(goal => goal.id === goalId);
    removeGoal(goalId);
    
    
    addToast(
      `Meta "${goalToDelete?.name}" excluída com sucesso.`,
      'info'
    );
  };

  const getGoalTypeInfo = (type) => {
    const types = {
      savings: { label: 'Economia', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' },
      spending_limit: { label: 'Limite de Gastos', icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-100' },
      income_target: { label: 'Meta de Receita', icon: Wallet, color: 'text-blue-600', bgColor: 'bg-blue-100' }
    };
    return types[type] || types.savings;
  };

  const formatCurrency = (amount) => {
    return `Kz ${amount?.toLocaleString('pt-BR') || '0'}`;
  };

  const completedGoals = goals.filter(goal => calculateGoalProgress(goal).isCompleted);
  const activeGoals = goals.filter(goal => !calculateGoalProgress(goal).isCompleted);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 pt-14 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Por favor, faça login para acessar as metas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 pt-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Metas Financeiras</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Defina e acompanhe seus objetivos financeiros
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 mt-4 sm:mt-0"
          >
            <Plus className="h-5 w-5" />
            <span>Nova Meta</span>
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Metas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídas</p>
                  <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Em Andamento</p>
                  <p className="text-2xl font-bold text-orange-600">{activeGoals.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Metas em Andamento</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeGoals.length === 0 ? (
              <Card className="lg:col-span-2 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {goals.length === 0 ? 'Nenhuma meta criada' : 'Nenhuma meta em andamento'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {goals.length === 0 ? 'Crie sua primeira meta financeira' : 'Todas as metas foram concluídas!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeGoals.map(goal => {
                const progress = calculateGoalProgress(goal);
                const typeInfo = getGoalTypeInfo(goal.type);
                const IconComponent = typeInfo.icon;

                return (
                  <Card key={goal.id} className="dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <CardTitle className="text-lg font-semibold dark:text-white">
                        {goal.name}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${typeInfo.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {goal.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                          <span className="font-semibold dark:text-white">{progress.progress.toFixed(1)}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Atual</p>
                            <p className="font-semibold dark:text-white">
                              {formatCurrency(progress.currentAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Meta</p>
                            <p className="font-semibold dark:text-white">
                              {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                        </div>

                        {progress.remaining > 0 && (
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                            <p className="text-orange-700 dark:text-orange-300 text-sm">
                              <strong>Faltam:</strong> {formatCurrency(progress.remaining)}
                            </p>
                          </div>
                        )}

                        {goal.deadline && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}

                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="w-full flex items-center justify-center px-4 py-2 text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Excluir Meta
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Metas Concluídas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedGoals.map(goal => {
                const progress = calculateGoalProgress(goal);
                const typeInfo = getGoalTypeInfo(goal.type);
                const IconComponent = typeInfo.icon;

                return (
                  <Card key={goal.id} className="dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg border-green-200 dark:border-green-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <CardTitle className="text-lg font-semibold dark:text-white">
                        {goal.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                          <IconComponent className={`h-5 w-5 ${typeInfo.color}`} />
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                        <p className="text-green-700 dark:text-green-300 font-semibold text-center">
                          🎉 Meta Concluída!
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Valor Alcançado:</span>
                          <span className="font-semibold dark:text-white">
                            {formatCurrency(progress.currentAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Meta:</span>
                          <span className="font-semibold dark:text-white">
                            {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="w-full flex items-center justify-center px-4 py-2 mt-4 text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Excluir Meta
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Nova Meta Financeira</h2>
                
                <form onSubmit={handleCreateGoal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome da Meta
                    </label>
                    <input
                      type="text"
                      required
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: Economizar para viagem"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição (Opcional)
                    </label>
                    <textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Descreva sua meta..."
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor da Meta (Kz)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Meta
                    </label>
                    <select
                      value={newGoal.type}
                      onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="savings">Economia</option>
                      <option value="spending_limit">Limite de Gastos</option>
                      <option value="income_target">Meta de Receita</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prazo (Opcional)
                    </label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Criar Meta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;