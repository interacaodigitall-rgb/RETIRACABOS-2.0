import React from 'react';
import { useTranslations } from '../contexts/TranslationsContext';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, t } = useTranslations();

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'pt' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
                {t('portuguese')}
            </button>
            <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'es' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
                {t('spanish')}
            </button>
        </div>
    );
};
