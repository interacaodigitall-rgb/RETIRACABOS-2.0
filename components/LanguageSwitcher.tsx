import React from 'react';

export const LanguageSwitcher: React.FC = () => {
    // FIX: The `useTranslations` hook no longer returns `language` and `setLanguage`
    // because the app is now single-language. The component is now non-functional
    // and returns null to fix the compilation error.
    return null;
};
