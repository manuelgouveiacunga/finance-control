import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Plus, X } from 'lucide-react';

export function NewTransactionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { addTransaction } = useTransactions();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      ...formData,
      amount: formData.type === 'expense' ? -Number(formData.amount) : Number(formData.amount)
    });
    setIsOpen(false);
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-primary-700 transition-colors"
      >
        <Plus className="h-4 w-4" /> Nova Transação
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Nova Transação</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valor
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
