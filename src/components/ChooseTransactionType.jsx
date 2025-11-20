import React from 'react';
import { FileText, Edit } from 'lucide-react';

const ChooseTransactionType = ({ onChoose }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-center mb-6">Adicionar nova transação</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onChoose('manual')}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Edit className="h-12 w-12 text-primary-600 mb-2" />
          <span className="font-medium">Manualmente</span>
        </button>
        <button
          onClick={() => onChoose('receipt')}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FileText className="h-12 w-12 text-primary-600 mb-2" />
          <span className="font-medium">Comprovativo</span>
        </button>
      </div>
    </div>
  );
};

export default ChooseTransactionType;
