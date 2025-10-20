import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language, i18n]);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    setLanguage(newLanguage);
  };

  const changeLanguage = (lang) => {
    if (['en', 'hi'].includes(lang)) {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    toggleLanguage,
    changeLanguage,
    isHindi: language === 'hi',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
