import { FileText, Edit, X } from 'lucide-react';

const ChooseTransactionType = ({ onChoose, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-center mb-6 dark:text-white">
            Adicionar nova transação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onChoose('manual')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <Edit className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium dark:text-white">Manualmente</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                Digite os dados da transação
              </span>
            </button>
            <button
              onClick={() => onChoose('receipt')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <FileText className="h-12 w-12 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium dark:text-white">Comprovativo</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                Faça upload de um recibo
              </span>
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseTransactionType;