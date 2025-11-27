import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await requestPasswordReset(email.trim());

    setLoading(false);

    if (!res.success) {
      addToast(res.message || 'Erro ao processar.', 'error');
      return;
    }

    const token = res.token;
    addToast('Link de redefinição criado. Abrindo a página de redefinição...', 'success');
    navigate(`/reset-password?token=${token}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="relative max-w-md w-full bg-white p-6 rounded shadow">

        {/* Botão para voltar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={22} />
        </button>

        <h2 className="text-lg text-gray-950 font-semibold mb-4 text-center">Recuperar senha</h2>

        <p className="text-sm text-slate-950 mb-4 text-center">
          Insira o e-mail associado à sua conta. Se existir, geraremos um link para redefinir a senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded text-gray-950"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            {loading ? 'Processando...' : 'Enviar link de redefinição'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
