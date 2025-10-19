
import React from 'react';
import { useTranslations } from '../contexts/TranslationsContext';

interface EndJobModalProps {
  onConfirm: (action: 'finish' | 'finishAndNew') => void;
  onCancel: () => void;
}

const EndJobModal: React.FC<EndJobModalProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-4">{t('endJobTitle')}</h2>
        <p className="text-gray-300 mb-6">{t('endJobConfirmation')}</p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 gap-3">
          <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors w-full sm:w-auto">{t('cancel')}</button>
          <button type="button" onClick={() => onConfirm('finish')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors w-full sm:w-auto">{t('confirmEndJobAndReturn')}</button>
          <button type="button" onClick={() => onConfirm('finishAndNew')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors w-full sm:w-auto">{t('confirmEndJobAndNew')}</button>
        </div>
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out forwards;
}
`;
document.head.appendChild(style);


export default EndJobModal;
