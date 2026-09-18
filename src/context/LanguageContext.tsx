import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationSchema } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dict: TranslationSchema;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('tifaout_lang');
      return (saved === 'ar' || saved === 'fr') ? saved : 'fr';
    } catch {
      return 'fr';
    }
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    try {
      localStorage.setItem('tifaout_lang', language);
    } catch {}
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const dict: TranslationSchema = translations[language] || translations.fr;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dict, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};