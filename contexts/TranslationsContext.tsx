import React, { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';

// Import translations from a TypeScript module for robust loading
import ptTranslations from '../locales/pt';

type Translations = Record<string, string>;

interface TranslationsContextType {
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const TranslationsContext = createContext<TranslationsContextType | undefined>(undefined);

// App is now single-language (Portuguese)
const translationsData: Translations = ptTranslations;

export const TranslationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    let translation = translationsData[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([replaceKey, value]) => {
        translation = translation.replace(`{${replaceKey}}`, String(value));
      });
    }
    return translation;
  }, []);

  // useMemo is still good practice, though dependencies are now static
  const value = useMemo(() => ({ t }), [t]);

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
