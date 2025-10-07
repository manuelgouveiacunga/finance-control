import { useTransactions } from './context/TransactionContext';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import FinanceDashboard from './pages/FinanceDashboard';
import AuthPage from './pages/AuthPage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={currentUser ? <FinanceDashboard /> : <Navigate to="/auth" />} />
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;