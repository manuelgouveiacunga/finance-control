import { useAuth } from './context/AuthContext';
import FinanceDashboard from './pages/FinanceDashboard';
import AuthPage from './pages/AuthPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import GoalsPage from './pages/GoalsPage'; 
import LoadingSpinner from './components/LoadingSpinner';
import MainLayout from './components/MainLayout';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  return currentUser ? children : <Navigate to="/auth" replace />;
}

const AnalyticsPage = () => <h1>Análises</h1>;

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
        <MainLayout>
          <FinanceDashboard />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ReportsPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AnalyticsPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/goals",
    element: (
      <ProtectedRoute>
        <MainLayout>
            <GoalsPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;