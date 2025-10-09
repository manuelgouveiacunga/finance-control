import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTransactions } from '../context/TransactionContext';
import { useToast } from '../context/ToastContext';
import { Plus, X } from 'lucide-react';

export function NewTransactionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { addTransaction, transactions } = useTransactions();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const amountValue = Number(formData.amount);
    
    if (formData.type === 'expense' && amountValue > totalBalance) {
      addToast('Saldo insuficiente para esta despesa!', 'error');
      return;
    }
    
    addTransaction({
      ...formData,
      amount: formData.type === 'expense' ? -amountValue : amountValue
    });
    setIsOpen(false);
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category: ''
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 sm:p-3 bg-primary-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm hover:bg-primary-700 transition-colors min-w-0 whitespace-nowrap"
      >
        <Plus className="h-4 w-4 flex-shrink-0" />
        <span className="hidden xs:inline">Nova Transação</span>
        <span className="xs:hidden">Nova</span>
      </button>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-overlay"
          style={{ zIndex: 99999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto modal-content shadow-2xl"
            style={{ zIndex: 100000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Nova Transação</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base input-mobile text-gray-900 placeholder-gray-800"
                  placeholder="Digite a descrição da transação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base input-mobile text-gray-900 placeholder-gray-800"
                  placeholder="0,00"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base input-mobile text-gray-900"
                  >
                    <option value="expense" className="text-gray-900">Despesa</option>
                    <option value="income" className="text-gray-900">Receita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base input-mobile text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base input-mobile text-gray-900 placeholder-gray-800"
                  placeholder="Ex: Alimentação, Transporte, etc."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 form-buttons">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors order-1 sm:order-2"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

