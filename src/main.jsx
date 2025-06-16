import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { TransactionProvider } from './context/TransactionContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <TransactionProvider>
        <App />
      </TransactionProvider>
    </ThemeProvider>
  </React.StrictMode>,
)