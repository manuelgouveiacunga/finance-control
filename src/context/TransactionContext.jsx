import { createContext, useContext, useState } from 'react';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([
    { id: 1, description: 'Salário', amount: 5000, type: 'income', date: '2024-03-20' },
    { id: 2, description: 'Aluguel', amount: -1200, type: 'expense', date: '2024-03-15' },
    { id: 3, description: 'Supermercado', amount: -500, type: 'expense', date: '2024-03-10' },
  ]);

  const addTransaction = (transaction) => {
    setTransactions([...transactions, { ...transaction, id: Date.now() }]);
  };

  const removeTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, removeTransaction }}>
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