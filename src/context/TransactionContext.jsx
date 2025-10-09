import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const { currentUser } = useAuth();
  
  const loadTransactionsFromStorage = () => {
    try {
      if (currentUser) {
        const savedTransactions = localStorage.getItem(`finance-transactions-${currentUser.email}`);
        if (savedTransactions) {
          return JSON.parse(savedTransactions);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar transações do localStorage:', error);
    }
    
    return [];
  };

  const [transactions, setTransactions] = useState([]);

  const saveTransactionsToStorage = (transactionsData) => {
    try {
      if (currentUser) {
        localStorage.setItem(`finance-transactions-${currentUser.email}`, JSON.stringify(transactionsData));
      }
    } catch (error) {
      console.error('Erro ao salvar transações no localStorage:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const userTransactions = loadTransactionsFromStorage();
      setTransactions(userTransactions);
    } else {
      setTransactions([]);
    }
  }, [currentUser]);
  useEffect(() => {
    saveTransactionsToStorage(transactions);
  }, [transactions]);

  const addTransaction = (transaction) => {
    const newTransactions = [
      ...transactions,
      {
        ...transaction,
        id: Date.now()
      }
    ];
    setTransactions(newTransactions);
  };

  const removeTransaction = (id) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
  };

  const clearAllTransactions = () => {
    setTransactions([]);
    if (currentUser) {
      localStorage.removeItem(`finance-transactions-${currentUser.email}`);
    }
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