import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

const LanguageToggle = ({ className = '' }) => {
  const { t } = useTranslation();
  const { language, toggleLanguage, isHindi, isEnglish } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${className}`}
      aria-label="Toggle Language"
    >
      <span className="text-xl">
        {isEnglish ? '🇮🇳' : '🇬🇧'}
      </span>
      <span>
        {isEnglish ? 'हिंदी' : 'English'}
      </span>
    </button>
  );
};

export default LanguageToggle;
