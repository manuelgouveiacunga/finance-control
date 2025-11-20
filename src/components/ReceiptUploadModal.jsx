import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UploadCloud, FileText, AlertTriangle } from 'lucide-react';
import Tesseract from 'tesseract.js';

const ReceiptUploadModal = ({ isOpen, onClose, onComplete, onError }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisError(null);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisError(null);

    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng+por', // English and Portuguese
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setAnalysisProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const regex = /(?:[R$]|\bTOTAL\b\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/g;
      let match;
      let amounts = [];
      while ((match = regex.exec(text)) !== null) {
        const formattedNumber = match[1].replace(/\./g, '').replace(',', '.');
        amounts.push(parseFloat(formattedNumber));
      }

      const extractedAmount = amounts.length > 0 ? Math.max(...amounts) : null;

      if (extractedAmount) {
        onComplete(extractedAmount.toFixed(2));
      } else {
        const errorMsg = 'Não foi possível encontrar um valor válido no comprovativo. Por favor, tente com uma imagem mais nítida ou adicione manualmente.';
        setAnalysisError(errorMsg);
        if (onError) onError(errorMsg);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      const errorMsg = 'Ocorreu um erro ao analisar o comprovativo. Por favor, tente novamente.';
      setAnalysisError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload de Comprovativo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ficheiro do Comprovativo (JPG ou PDF)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                  >
                    <span>Carregar um ficheiro</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, PDF até 10MB
                </p>
              </div>
            </div>
          </div>

          {analysisError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-md flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{analysisError}</p>
            </div>
          )}

          {file && !isAnalyzing && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ficheiro Selecionado</h3>
              <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
                  ) : (
                    <FileText className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-primary-600">Analisando...</p>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${analysisProgress}%` }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{analysisProgress}%</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-800"
          >
            {isAnalyzing ? 'Analisando...' : 'Analisar e Continuar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReceiptUploadModal;
