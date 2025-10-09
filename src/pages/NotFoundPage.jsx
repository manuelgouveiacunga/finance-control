import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Home, ArrowLeft, TrendingUp, DollarSign } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    setIsVisible(true);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>

      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-20 w-32 h-32 rounded-full opacity-20 animate-pulse ${
          theme === 'dark' ? 'bg-blue-400' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute top-40 right-32 w-24 h-24 rounded-full opacity-30 animate-bounce ${
          theme === 'dark' ? 'bg-purple-400' : 'bg-purple-300'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-32 left-32 w-20 h-20 rounded-full opacity-25 animate-ping ${
          theme === 'dark' ? 'bg-green-400' : 'bg-green-300'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-20 right-20 w-28 h-28 rounded-full opacity-20 animate-pulse ${
          theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-300'
        }`} style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className={`relative z-10 text-center max-w-2xl mx-auto transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>

        <div className="relative mb-8">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 animate-bounce ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl shadow-blue-500/25' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-2xl shadow-blue-500/25'
          }`}>
            <TrendingUp className="w-16 h-16 text-white animate-pulse" />
          </div>

          <DollarSign className={`absolute -top-2 -right-2 w-8 h-8 animate-spin ${
            theme === 'dark' ? 'text-green-400' : 'text-green-500'
          }`} style={{ animationDuration: '3s' }} />
          <DollarSign className={`absolute -bottom-2 -left-2 w-6 h-6 animate-spin ${
            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
          }`} style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
        </div>

        <div className="mb-6">
          <h1 className={`text-8xl md:text-9xl font-bold mb-4 animate-pulse ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            404
          </h1>
        </div>

        <div className="mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Oops! Página não encontrada
          </h2>
          <p className={`text-lg mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Parece que você se perdeu no mundo das finanças! 💰
            <br />
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className={`mb-8 p-4 rounded-lg ${
          theme === 'dark' 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Redirecionando automaticamente em{' '}
            <span className={`font-bold text-xl ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {countdown}
            </span>{' '}
            segundos
          </p>
          
          <div className={`w-full h-2 rounded-full mt-2 overflow-hidden ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
              style={{ width: `${((10 - countdown) / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <Home className="w-5 h-5 mr-2" />
            Ir para Dashboard
          </button>
          
          <button
            onClick={handleGoBack}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md hover:shadow-lg'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
        </div>

        <div className={`mt-12 p-6 rounded-lg ${
          theme === 'dark' 
            ? 'bg-gray-800/30 border border-gray-700' 
            : 'bg-white/30 border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            💡 Dicas úteis:
          </h3>
          <ul className={`text-sm space-y-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <li>• Verifique se o URL está correto</li>
            <li>• Use o menu de navegação para encontrar o que procura</li>
            <li>• Acesse o Dashboard para gerenciar suas finanças</li>
            <li>• Consulte os Relatórios para análises detalhadas</li>
          </ul>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-30 animate-ping ${
              theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotFoundPage;