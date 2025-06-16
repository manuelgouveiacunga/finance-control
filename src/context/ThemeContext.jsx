import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Função para carregar o tema do localStorage
  const loadThemeFromStorage = () => {
    try {
      const savedTheme = localStorage.getItem('finance-theme');
      if (savedTheme) {
        return savedTheme;
      }
    } catch (error) {
      console.error('Erro ao carregar tema do localStorage:', error);
    }
    
    // Verifica a preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light'; // Tema padrão
  };

  const [theme, setTheme] = useState(loadThemeFromStorage);

  // Função para alternar entre temas
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // useEffect para salvar o tema no localStorage e aplicar no documento
  useEffect(() => {
    try {
      localStorage.setItem('finance-theme', theme);
      
      // Adiciona ou remove a classe 'dark' no elemento html
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}