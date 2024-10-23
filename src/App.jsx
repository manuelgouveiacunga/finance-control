import { TransactionProvider } from './context/TransactionContext';
import FinanceDashboard from './pages/FinanceDashboard'; 

function App() {
  return (
    <TransactionProvider>
      <FinanceDashboard />
    </TransactionProvider>
  );
}

export default App;