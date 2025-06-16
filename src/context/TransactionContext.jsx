import { createContext, useContext, useState, useEffect } from 'react';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  // Função para carregar transações do localStorage
  const loadTransactionsFromStorage = () => {
    try {
      const savedTransactions = localStorage.getItem('finance-transactions');
      if (savedTransactions) {
        return JSON.parse(savedTransactions);
      }
    } catch (error) {
      console.error('Erro ao carregar transações do localStorage:', error);
    }
    
    // Retorna dados padrão se não houver dados salvos
    return [
      { id: 1, description: 'Salário', amount: 5000, type: 'income', date: '2024-03-20' },
      { id: 2, description: 'Aluguel', amount: -1200, type: 'expense', date: '2024-03-15' },
      { id: 3, description: 'Supermercado', amount: -500, type: 'expense', date: '2024-03-10' },
    ];
  };

  const [transactions, setTransactions] = useState(loadTransactionsFromStorage);

  // Função para salvar transações no localStorage
  const saveTransactionsToStorage = (transactionsData) => {
    try {
      localStorage.setItem('finance-transactions', JSON.stringify(transactionsData));
    } catch (error) {
      console.error('Erro ao salvar transações no localStorage:', error);
    }
  };

  // useEffect para salvar no localStorage sempre que transactions mudar
  useEffect(() => {
    saveTransactionsToStorage(transactions);
  }, [transactions]);

  const addTransaction = (transaction) => {
    const currentDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const newTransactions = [
      ...transactions, 
      { 
        ...transaction, 
        id: Date.now(),
        date: currentDate // Data automática
      }
    ];
    setTransactions(newTransactions);
  };

  const removeTransaction = (id) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
  };

  // Função adicional para limpar todos os dados (opcional)
  const clearAllTransactions = () => {
    setTransactions([]);
    localStorage.removeItem('finance-transactions');
  };

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      addTransaction, 
      removeTransaction, 
      clearAllTransactions 
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}