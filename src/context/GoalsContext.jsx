import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GoalsContext = createContext();

export function GoalsProvider({ children }) {
  const { currentUser } = useAuth();
  
  const loadGoalsFromStorage = () => {
    try {
      if (currentUser) {
        const savedGoals = localStorage.getItem(`finance-goals-${currentUser.email}`);
        if (savedGoals) {
          return JSON.parse(savedGoals);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar metas do localStorage:', error);
    }
    
    return [];
  };

  const [goals, setGoals] = useState([]);

  const saveGoalsToStorage = (goalsData) => {
    try {
      if (currentUser) {
        localStorage.setItem(`finance-goals-${currentUser.email}`, JSON.stringify(goalsData));
      }
    } catch (error) {
      console.error('Erro ao salvar metas no localStorage:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const userGoals = loadGoalsFromStorage();
      setGoals(userGoals);
    } else {
      setGoals([]);
    }
  }, [currentUser]);

  useEffect(() => {
    saveGoalsToStorage(goals);
  }, [goals]);

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const removeGoal = (id) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const updateGoal = (id, updatedGoal) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updatedGoal } : goal
    ));
  };

  const clearAllGoals = () => {
    setGoals([]);
    if (currentUser) {
      localStorage.removeItem(`finance-goals-${currentUser.email}`);
    }
  };

  return (
    <GoalsContext.Provider value={{
      goals,
      addGoal,
      removeGoal,
      updateGoal,
      clearAllGoals
    }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}