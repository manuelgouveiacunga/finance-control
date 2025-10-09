import { useTheme } from '../context/ThemeContext';
import { TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';

const LoadingSpinner = ({ message = "Carregando..." }) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Elementos de fundo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-20 w-24 h-24 rounded-full opacity-10 animate-pulse ${
          theme === 'dark' ? 'bg-blue-400' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute top-40 right-32 w-16 h-16 rounded-full opacity-20 animate-bounce ${
          theme === 'dark' ? 'bg-purple-400' : 'bg-purple-300'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-32 left-32 w-12 h-12 rounded-full opacity-15 animate-ping ${
          theme === 'dark' ? 'bg-green-400' : 'bg-green-300'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-20 right-20 w-20 h-20 rounded-full opacity-10 animate-pulse ${
          theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-300'
        }`} style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="relative mb-8">
          <div className={`w-24 h-24 mx-auto rounded-full border-4 border-transparent animate-spin ${
            theme === 'dark' 
              ? 'border-t-blue-400 border-r-purple-400' 
              : 'border-t-blue-500 border-r-purple-500'
          }`} style={{ animationDuration: '1s' }}>
          </div>
          
          <div className={`absolute inset-2 rounded-full flex items-center justify-center animate-pulse ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm' 
              : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm'
          }`}>
            <TrendingUp className={`w-8 h-8 animate-bounce ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <DollarSign className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-500'
            }`} />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
            <PieChart className={`absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
            }`} />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2.5s' }}>
            <BarChart3 className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
            }`} />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={`text-xl font-semibold animate-pulse ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {message}
          </h2>

          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full animate-bounce ${
                  theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                }`}
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>

        <div className={`mt-8 w-64 h-1 mx-auto rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div className={`h-full rounded-full animate-pulse ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600'
          }`} style={{
            width: '30%',
            animation: 'loading-bar 2s ease-in-out infinite'
          }}>
          </div>
        </div>

        <p className={`mt-6 text-sm opacity-75 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Preparando seu controle financeiro...
        </p>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full opacity-20 animate-ping ${
              theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1.5 + Math.random() * 1.5}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(200%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;