import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUser, addUser, updateUser } from '../lib/database';
import { createResetToken, verifyResetToken, consumeResetToken } from '../utils/passwordReset';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const dbUser = await getUser(user.email);
          if (dbUser) {
            setCurrentUser(dbUser);
          } else {
            setCurrentUser(null);
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const user = await getUser(email);
      if (user && user.password === password) {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify({ email: user.email }));
        return { success: true };
      } else {
        return { success: false, message: 'Credenciais inválidas. Por favor, verifique seu e-mail e senha.' };
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, message: 'Erro ao fazer login. Por favor, tente novamente.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const register = async (name, email, password) => {
    try {
      const existingUser = await getUser(email);
      if (existingUser) {
        return { success: false, message: 'Usuário já existe. Por favor, faça login ou use um e-mail diferente.' };
      }

      const newUser = { name, email, password };
      await addUser(newUser);
      setCurrentUser(newUser);
      localStorage.setItem('user', JSON.stringify({ email: newUser.email }));
      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { success: false, message: 'Erro ao registrar usuário. Por favor, tente novamente.' };
    }
  };

    
  const requestPasswordReset = async (email) => {
    try {
      const user = await getUser(email);
      if (!user) {
        return { success: false, message: 'Nenhum usuário encontrado com esse email.' };
      }

      const token = createResetToken(email);
      return { success: true, token };
    } catch (err) {
      console.error('requestPasswordReset error', err);
      return { success: false, message: 'Erro ao processar o pedido.' };
    }
  };

  
  const resetPasswordWithToken = async (token, newPassword) => {
    try {
      const check = verifyResetToken(token);
      if (!check.valid) {
        return { success: false, message: check.reason || 'Token inválido' };
      }
      const email = consumeResetToken(token);
      if (!email) {
        return { success: false, message: 'Token inválido ou já usado.' };
      }

      const updated = await updateUser(email, { password: newPassword });
      if (!updated) {
        return { success: false, message: 'Usuário não encontrado.' };
      }
      if (currentUser && currentUser.email === email) {
        setCurrentUser(updated);
      }
      return { success: true };
    } catch (err) {
      console.error('resetPasswordWithToken error', err);
      return { success: false, message: 'Erro ao resetar senha.' };
    }
  };


  const value = {
    currentUser,
    login,
    logout,
    register,
    loading,
    requestPasswordReset,
    resetPasswordWithToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};