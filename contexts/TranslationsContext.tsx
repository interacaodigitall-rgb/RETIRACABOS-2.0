import React, { createContext, useState, useContext, useCallback, useMemo, ReactNode, useEffect } from 'react';

type Language = 'pt' | 'es';
// We can't statically type this anymore, so we use a generic Record
type Translations = Record<string, string>;

interface TranslationsContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const TranslationsContext = createContext<TranslationsContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'es') {
    return 'es';
  }
  return 'pt';
};

export const TranslationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<Record<Language, Translations> | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        // Use relative paths from the root `index.html` file
        const [ptResponse, esResponse] = await Promise.all([
          fetch('./locales/pt.json'),
          fetch('./locales/es.json'),
        ]);
        if (!ptResponse.ok || !esResponse.ok) {
          throw new Error('Failed to load translation files from server.');
        }
        const pt = await ptResponse.json();
        const es = await esResponse.json();
        setTranslations({ pt, es });
      } catch (error) {
        console.error('Error loading translations:', error);
        // Set empty objects to allow the app to run, albeit without translations.
        setTranslations({ pt: {}, es: {} });
      }
    };
    fetchTranslations();
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    if (!translations) {
      return key; // Return key itself while translations are loading
    }
    let translation = translations[language][key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([replaceKey, value]) => {
        translation = translation.replace(`{${replaceKey}}`, String(value));
      });
    }
    return translation;
  }, [language, translations]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  // Don't render the rest of the app until translations are loaded
  if (!translations) {
    return null; // Or a loading spinner
  }

  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  );
};

export const useTranslations = (): TranslationsContextType => {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationsProvider');
  }
  return context;
};
