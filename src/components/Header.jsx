import { useState } from 'react';
import { useLang } from '../i18n/TranslationContext';

const TABS = ['today', 'tasks', 'calendar', 'ideas', 'stats'];

const TAB_ICONS = {
  today: '📌', tasks: '📋', calendar: '📅', ideas: '💡', stats: '📊',
};

const LANGUAGES = ['tr', 'en', 'es', 'fr', 'de'];

export default function Header({
  activeTab, onTabChange, searchQuery, onSearchChange, onPomodoroOpen,
}) {
  const { t, lang, setLang } = useLang();
  const [showLang, setShowLang] = useState(false);

  return (
    <header className="header">
      <div className="header-top">
        <span className="app-title">{t('app.title')}</span>
        <div className="header-right">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => onSearchChange('')}>✕</button>
            )}
          </div>
          <div className="lang-selector">
            <button className="lang-btn" onClick={() => setShowLang(!showLang)}>
              {t(`lang.${lang}`)}
            </button>
            {showLang && (
              <>
                <div className="lang-overlay" onClick={() => setShowLang(false)} />
                <div className="lang-dropdown">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l}
                      className={`lang-option ${l === lang ? 'active' : ''}`}
                      onClick={() => { setLang(l); setShowLang(false); }}
                    >
                      {t(`lang.${l}`)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button className="pomodoro-btn" onClick={onPomodoroOpen} title="Pomodoro">🍅</button>
        </div>
      </div>
      <nav className="tabs">
        {TABS.map((id) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            {TAB_ICONS[id]} {t(`tab.${id}`)}
          </button>
        ))}
      </nav>
    </header>
  );
}
