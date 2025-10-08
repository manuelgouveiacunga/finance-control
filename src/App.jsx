import { useTransactions } from './context/TransactionContext';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import FinanceDashboard from './pages/FinanceDashboard';
import AuthPage from './pages/AuthPage';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return currentUser ? children : <Navigate to="/auth" replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth" replace />
  },
  {
    path: "/auth",
    element: <AuthPage />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <FinanceDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <Navigate to="/auth" replace />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;