import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function readStoredLanguage() {
  try {
    return localStorage.getItem('language') || 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readStoredLanguage);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key, vars) => {
      const dict = translations[language] || translations.en;
      const value = getByPath(dict, key);
      if (typeof value === 'string') return interpolate(value, vars);
      // fallback to English
      const fallback = getByPath(translations.en, key);
      if (typeof fallback === 'string') return interpolate(fallback, vars);
      return key;
    },
    [language]
  );

  const toggleLanguage = useCallback(
    () => setLanguage((prev) => (prev === 'en' ? 'bn' : 'en')),
    []
  );

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
