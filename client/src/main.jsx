import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/i18n'; // ✅ Import i18n before using any LanguageContext or useTranslation
import './global.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
