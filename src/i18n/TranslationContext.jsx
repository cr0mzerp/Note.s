import { createContext, useContext, useState, useEffect } from 'react';
import translations, { LOCALE_MAP } from './translations';

const LangContext = createContext();

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('nottutucu_lang') || 'tr';
    } catch {
      return 'tr';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nottutucu_lang', lang);
    } catch { /* */ }
  }, [lang]);

  const t = (key, vars = {}) => {
    let text = translations[lang]?.[key] ?? translations.tr[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  const locale = LOCALE_MAP[lang] || 'tr-TR';

  return (
    <LangContext.Provider value={{ lang, setLang, t, locale }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within TranslationProvider');
  return ctx;
}
