import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login: loginContext, register: registerContext } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleLogin = async (email, password) => {
    const result = await loginContext(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  const handleRegister = async (name, email, password) => {
    const result = await registerContext(name, email, password);
    if (result.success) {
      addToast('Conta criada com sucesso! Faça login com suas credenciais.', 'success');
      setIsLogin(true);
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <div>
      {isLogin ? (
        <Login onSwitchToRegister={handleSwitchToRegister} onLogin={handleLogin} />
      ) : (
        <Register onSwitchToLogin={handleSwitchToLogin} onRegister={handleRegister} />
      )}
    </div>
  );
};

export default AuthPage;