import { TransactionProvider } from './context/TransactionContext';
import { ThemeProvider } from './context/ThemeContext';
import FinanceDashboard from './pages/FinanceDashboard'; 

function App() {
  return (
    <ThemeProvider>
      <TransactionProvider>
        <FinanceDashboard />
      </TransactionProvider>
    </ThemeProvider>
  );
}

export default App;