import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';

const useQuery = () => new URLSearchParams(useLocation().search);

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPasswordWithToken } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token');

  useEffect(() => {
    if (!token) {
      addToast('Token ausente. Volte ao pedido de recuperação.', 'error');
      navigate('/forgot-password');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      addToast('Senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    if (password !== confirm) {
      addToast('As senhas não coincidem.', 'error');
      return;
    }

    setLoading(true);
    const res = await resetPasswordWithToken(token, password);
    setLoading(false);

    if (!res.success) {
      addToast(res.message || 'Erro ao redefinir senha', 'error');
      return;
    }

    addToast('Senha atualizada com sucesso. Faça login.', 'success');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Criar nova senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            {loading ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
