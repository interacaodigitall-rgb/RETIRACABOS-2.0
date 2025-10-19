import React, { useState } from 'react';
import { useTranslations } from '../contexts/TranslationsContext';

interface StartJobModalProps {
  onStart: (data: { jobName: string }) => void;
  onCancel: () => void;
}

const StartJobModal: React.FC<StartJobModalProps> = ({ onStart, onCancel }) => {
  const { t } = useTranslations();
  const [jobName, setJobName] = useState(`Trabalho_${new Date().toISOString().slice(0, 10)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobName.trim()) {
      onStart({ jobName });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-6">{t('startJobTitle')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="jobName" className="block text-sm font-medium text-gray-300 mb-1">{t('jobName')}</label>
            <input
              type="text"
              id="jobName"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('jobNamePlaceholder')}
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors">{t('cancel')}</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors">{t('startJob')}</button>
          </div>
        </form>
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

export default StartJobModal;