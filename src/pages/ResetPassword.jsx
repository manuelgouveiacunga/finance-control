import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
      <div className="max-w-md w-full bg-white p-6 rounded shadow relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-950 text-center">Criar nova senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded text-gray-700"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nova senha
            </label>
            <input
              id="confirm"
              type="password"
              placeholder="Confirmar nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border px-3 py-2 rounded text-gray-700"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
